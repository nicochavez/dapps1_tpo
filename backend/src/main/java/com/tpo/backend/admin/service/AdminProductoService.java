package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.AprobarProductoRequest;
import com.tpo.backend.admin.dto.RechazarProductoRequest;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.service.CatalogoService;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.multa.entity.MultaEntity;
import com.tpo.backend.multa.repository.MultaRepository;
import com.tpo.backend.notificacion.service.NotificacionService;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.entity.EstadoProducto;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.producto.service.ProductoService;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalTime;
import java.time.OffsetDateTime;
import java.time.format.DateTimeParseException;
import java.util.List;

/**
 * Backoffice de bienes (RF flujo vendedor). Permite a un empleado aprobar un bien
 * proponiendo condiciones (precio base, comision, catalogo/subasta) o rechazarlo con
 * un motivo y cargo de devolucion. En ambos casos notifica al dueno.
 */
@Service
public class AdminProductoService {

    private static final Logger log = LoggerFactory.getLogger(AdminProductoService.class);

    /** Cargo por defecto de la devolucion del bien cuando el empleado no informa uno. */
    private static final BigDecimal CARGO_DEVOLUCION_DEFAULT = new BigDecimal("5000.00");

    private final ProductoRepository productoRepository;
    private final SubastaRepository subastaRepository;
    private final ClienteRepository clienteRepository;
    private final MultaRepository multaRepository;
    private final CatalogoService catalogoService;
    private final ProductoService productoService;
    private final NotificacionService notificacionService;

    public AdminProductoService(ProductoRepository productoRepository,
                                SubastaRepository subastaRepository,
                                ClienteRepository clienteRepository,
                                MultaRepository multaRepository,
                                CatalogoService catalogoService,
                                ProductoService productoService,
                                NotificacionService notificacionService) {
        this.productoRepository = productoRepository;
        this.subastaRepository = subastaRepository;
        this.clienteRepository = clienteRepository;
        this.multaRepository = multaRepository;
        this.catalogoService = catalogoService;
        this.productoService = productoService;
        this.notificacionService = notificacionService;
    }

    @Transactional
    public List<ProductoDto> listarPendientes() {
        return productoRepository.findByEstado(EstadoProducto.en_revision).stream()
                .map(productoService::toDto)
                .toList();
    }

    @Transactional
    public ProductoDto aprobar(Long productoId, AprobarProductoRequest request) {
        ProductoEntity producto = findEnRevision(productoId);

        // Crea el item de catalogo (valida minimo de fotos RF-14) con las condiciones propuestas.
        ItemCatalogoNewRequest itemRequest = new ItemCatalogoNewRequest();
        itemRequest.setCatalogo(request.getCatalogoId());
        itemRequest.setProducto(productoId);
        itemRequest.setPrecioBase(request.getPrecioBase());
        itemRequest.setComision(request.getComision());
        catalogoService.crearItem(itemRequest);

        // El admin fija fecha/hora/lugar de la subasta desde Swagger (RF flujo vendedor).
        aplicarDatosSubasta(request);

        producto.setEstado(EstadoProducto.propuesta_enviada);
        productoRepository.save(producto);

        notificarAceptacion(producto, request);
        log.info("Producto {} aprobado: propuesta enviada al dueno {}", productoId, producto.getDuenio().getId());
        return productoService.toDto(producto);
    }

    /** Si el admin informo fecha/hora/ubicacion/categoria, las graba en la subasta del catalogo. */
    private void aplicarDatosSubasta(AprobarProductoRequest request) {
        if (request.getFecha() == null && request.getHora() == null
                && request.getUbicacion() == null && request.getCategoria() == null) {
            return;
        }
        SubastaEntity subasta = subastaRepository.findByCatalogoId(request.getCatalogoId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "No hay subasta asociada al catalogo " + request.getCatalogoId()));
        try {
            if (request.getFecha() != null && !request.getFecha().isBlank()) {
                subasta.setFecha(LocalDate.parse(request.getFecha().trim()));
            }
            if (request.getHora() != null && !request.getHora().isBlank()) {
                subasta.setHora(LocalTime.parse(request.getHora().trim()));
            }
        } catch (DateTimeParseException e) {
            throw new UnprocessableEntityException(
                    "Fecha u hora con formato invalido (esperado yyyy-MM-dd y HH:mm): " + e.getMessage());
        }
        if (request.getUbicacion() != null && !request.getUbicacion().isBlank()) {
            subasta.setUbicacion(request.getUbicacion().trim());
        }
        if (request.getCategoria() != null && !request.getCategoria().isBlank()) {
            subasta.setCategoria(request.getCategoria().trim().toLowerCase());
        }
        subastaRepository.save(subasta);
    }

    @Transactional
    public ProductoDto rechazar(Long productoId, RechazarProductoRequest request) {
        ProductoEntity producto = findEnRevision(productoId);

        producto.setEstado(EstadoProducto.rechazado);
        producto.setMotivoRechazo(request.getMotivo());
        productoRepository.save(producto);

        BigDecimal cargo = request.getCargoDevolucion() != null
                ? request.getCargoDevolucion() : CARGO_DEVOLUCION_DEFAULT;
        registrarDevolucionConCargo(producto, cargo);

        notificacionService.enviar(producto.getDuenio().getId(),
                "Tu articulo fue rechazado",
                "Motivo: " + request.getMotivo()
                        + ". Se registro un cargo de devolucion de $" + cargo
                        + " que debes abonar para retirar el bien.");
        log.info("Producto {} rechazado. Cargo de devolucion ${} al dueno {}",
                productoId, cargo, producto.getDuenio().getId());
        return productoService.toDto(producto);
    }

    private ProductoEntity findEnRevision(Long productoId) {
        ProductoEntity producto = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));
        if (producto.getEstado() != EstadoProducto.en_revision) {
            throw new UnprocessableEntityException(
                    "El producto no esta pendiente de inspeccion (estado actual: " + producto.getEstado() + ").");
        }
        return producto;
    }

    private void notificarAceptacion(ProductoEntity producto, AprobarProductoRequest request) {
        SubastaEntity subasta = subastaRepository.findByCatalogoId(request.getCatalogoId()).orElse(null);
        String fecha = subasta != null && subasta.getFecha() != null ? subasta.getFecha().toString() : "a confirmar";
        String hora = subasta != null && subasta.getHora() != null ? subasta.getHora().toString() : "a confirmar";
        String lugar = subasta != null && subasta.getUbicacion() != null ? subasta.getUbicacion() : "a confirmar";

        String mensaje = "Tu bien fue aceptado. Subasta: " + fecha + " " + hora + " en " + lugar
                + ". Precio base por item: $" + request.getPrecioBase()
                + ". Comision: $" + request.getComision()
                + ". Ingresa a la app para aceptar o rechazar estas condiciones.";
        notificacionService.enviar(producto.getDuenio().getId(), "Tu articulo fue aceptado", mensaje);
    }

    private void registrarDevolucionConCargo(ProductoEntity producto, BigDecimal cargo) {
        ClienteEntity cliente = clienteRepository.findById(producto.getDuenio().getId())
                .orElseThrow(() -> new ResourceNotFoundException(
                        "Cliente no encontrado para el dueno: " + producto.getDuenio().getId()));

        MultaEntity multa = new MultaEntity();
        multa.setCliente(cliente);
        multa.setImporteOriginal(cargo);
        multa.setMulta(cargo);
        multa.setEstado("pendiente");
        multa.setFechaLimite(OffsetDateTime.now().plusDays(30));
        multaRepository.save(multa);
    }
}
