package com.tpo.backend.producto.service;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.common.exception.ForbiddenException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.duenio.entity.DuenioEntity;
import com.tpo.backend.duenio.repository.DuenioRepository;
import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.empleado.repository.EmpleadoRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.dto.ProductoNewRequest;
import com.tpo.backend.producto.dto.ProductoUpdateRequest;
import com.tpo.backend.producto.dto.PropuestaDto;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.SubastaRepository;
import com.tpo.backend.producto.entity.EstadoProducto;
import com.tpo.backend.producto.entity.FotoEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.seguro.entity.SeguroEntity;
import com.tpo.backend.seguro.repository.SeguroRepository;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Service
public class ProductoService {

    /** Empleado del sistema que actua como verificador por defecto (ver AuthService). */
    private static final Long VERIFICADOR_SISTEMA_ID = 2L;

    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final PersonaRepository personaRepository;
    private final SeguroRepository seguroRepository;
    private final DuenioRepository duenioRepository;
    private final EmpleadoRepository empleadoRepository;
    private final ItemCatalogoRepository itemCatalogoRepository;
    private final SubastaRepository subastaRepository;

    public ProductoService(ProductoRepository productoRepository,
                           FotoRepository fotoRepository,
                           PersonaRepository personaRepository,
                           SeguroRepository seguroRepository,
                           DuenioRepository duenioRepository,
                           EmpleadoRepository empleadoRepository,
                           ItemCatalogoRepository itemCatalogoRepository,
                           SubastaRepository subastaRepository) {
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.personaRepository = personaRepository;
        this.seguroRepository = seguroRepository;
        this.duenioRepository = duenioRepository;
        this.empleadoRepository = empleadoRepository;
        this.itemCatalogoRepository = itemCatalogoRepository;
        this.subastaRepository = subastaRepository;
    }

    private EmpleadoEntity findEmpleado(Long id) {
        return empleadoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado: " + id));
    }

    private SeguroEntity findSeguro(String nroPoliza) {
        return seguroRepository.findById(nroPoliza)
                .orElseThrow(() -> new ResourceNotFoundException("Seguro no encontrado: " + nroPoliza));
    }

    @Transactional
    public List<ProductoDto> listar(Boolean disponible, int page, int size) {
        var pageable = PageRequest.of(page, size);
        if (disponible == null) {
            return productoRepository.findAll(pageable).stream().map(this::toDto).toList();
        }
        return productoRepository.findByDisponible(disponible, pageable).stream().map(this::toDto).toList();
    }

    @Transactional
    public List<ProductoDto> listarPorDuenio(Long personaId) {
        return productoRepository.findByDuenioId(personaId).stream().map(this::toDto).toList();
    }

    @Transactional
    public ProductoDto getById(Long id) {
        ProductoEntity prod = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        return toDto(prod);
    }

    /** Bytes de una foto que pertenece al producto indicado (para servirla por HTTP). */
    @Transactional(readOnly = true)
    public byte[] getFotoBytes(Long productoId, Long fotoId) {
        return fotoRepository.findById(fotoId)
                .filter(f -> f.getProducto().getId().equals(productoId))
                .map(FotoEntity::getFoto)
                .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada: " + fotoId));
    }

    @Transactional
    public ProductoDto actualizar(Long id, ProductoUpdateRequest request, List<MultipartFile> fotos) {
        ProductoEntity prod = productoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + id));
        if (request.getFecha() != null) prod.setFecha(LocalDate.parse(request.getFecha()));
        if (request.getDisponible() != null) prod.setDisponible(request.getDisponible());
        if (request.getDescripcionCatalogo() != null) prod.setDescripcionCatalogo(request.getDescripcionCatalogo());
        if (request.getDescripcionCompleta() != null) prod.setDescripcionCompleta(request.getDescripcionCompleta());
        if (request.getRevisor() != null) prod.setRevisor(findEmpleado(request.getRevisor()));
        if (request.getSeguro() != null) prod.setSeguro(findSeguro(request.getSeguro()));
        if (request.getCategoria() != null) prod.setCategoria(request.getCategoria());
        if (request.getSubcategoria() != null) prod.setSubcategoria(request.getSubcategoria());
        if (request.getArtista() != null) prod.setArtista(request.getArtista());
        if (request.getResenia() != null) prod.setResenia(request.getResenia());
        if (request.getEstado() != null) prod.setEstado(request.getEstado());
        productoRepository.save(prod);
        saveFotos(prod, fotos);
        return toDto(prod);
    }

    @Transactional
    public ProductoDto agregarFotos(Long productoId, List<MultipartFile> fotos) {
        ProductoEntity prod = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));
        saveFotos(prod, fotos);
        return toDto(prod);
    }

    @Transactional
    public ProductoDto eliminarFotos(Long productoId, List<Long> fotoIds) {
        if (!productoRepository.existsById(productoId)) {
            throw new ResourceNotFoundException("Producto no encontrado: " + productoId);
        }
        fotoIds.forEach(fotoId -> {
            FotoEntity foto = fotoRepository.findById(fotoId)
                    .filter(f -> f.getProducto().getId().equals(productoId))
                    .orElseThrow(() -> new ResourceNotFoundException("Foto no encontrada: " + fotoId));
            fotoRepository.delete(foto);
        });
        return toDto(productoRepository.findById(productoId).get());
    }

    @Transactional
    public ProductoDto crear(Long duenioId, ProductoNewRequest request, List<MultipartFile> fotos) {
        DuenioEntity duenio = ensureDuenio(duenioId);
        ProductoEntity prod = new ProductoEntity();
        prod.setFecha(LocalDate.parse(request.getFecha()));
        prod.setDisponible(request.getDisponible());
        prod.setDescripcionCatalogo(request.getDescripcionCatalogo() != null ?
                request.getDescripcionCatalogo() : "No Posee");
        prod.setDescripcionCompleta(request.getDescripcionCompleta());
        Long revisorId = request.getRevisor() != null ? request.getRevisor() : VERIFICADOR_SISTEMA_ID;
        prod.setRevisor(findEmpleado(revisorId));
        if (request.getSeguro() != null) prod.setSeguro(findSeguro(request.getSeguro()));
        prod.setCategoria(request.getCategoria());
        prod.setSubcategoria(request.getSubcategoria());
        prod.setArtista(request.getArtista());
        prod.setResenia(request.getResenia());
        prod.setEstado(request.getEstado() != null ? request.getEstado() : EstadoProducto.en_revision);
        prod.setDuenio(duenio);
        prod = productoRepository.save(prod);
        saveFotos(prod, fotos);
        return toDto(prod);
    }

    /**
     * Garantiza que la persona tenga rol DUENIO. {@code productos.duenio} referencia a
     * {@code duenios}, y el registro solo crea {@code clientes}; al enviar su primer bien
     * (RF-45) la persona adquiere el rol de dueño de forma diferida.
     */
    private DuenioEntity ensureDuenio(Long personaId) {
        return duenioRepository.findById(personaId).orElseGet(() -> {
            DuenioEntity duenio = new DuenioEntity();
            PersonaEntity persona = personaRepository.findById(personaId)
                    .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + personaId));
            duenio.setPersona(persona);
            duenio.setVerificador(findEmpleado(VERIFICADOR_SISTEMA_ID));
            if (persona.getPaisOrigen() != null) {
                duenio.setNumeroPais(persona.getPaisOrigen().getNumero());
            }
            return duenioRepository.save(duenio);
        });
    }

    private void saveFotos(ProductoEntity prod, List<MultipartFile> fotos) {
        if (fotos == null) return;
        fotos.forEach(file -> {
            try {
                FotoEntity foto = new FotoEntity();
                foto.setProducto(prod);
                foto.setFoto(file.getBytes());
                fotoRepository.save(foto);
            } catch (IOException e) {
                throw new RuntimeException("Error al procesar foto: " + file.getOriginalFilename(), e);
            }
        });
    }

    // --- Propuesta de condiciones: aceptacion/rechazo por el dueno -----------

    /** Devuelve las condiciones propuestas (precio base, comision, fecha/hora/lugar) para el dueno. */
    @Transactional(readOnly = true)
    public PropuestaDto getPropuesta(Long personaId, Long productoId) {
        ProductoEntity prod = findPropioDueno(personaId, productoId);
        ItemCatalogoEntity item = itemCatalogoRepository.findByProductoId(productoId).orElse(null);

        PropuestaDto.SubastaInfo subastaInfo = null;
        BigDecimal precioBase = null;
        BigDecimal comision = null;
        if (item != null) {
            precioBase = item.getPrecioBase();
            comision = item.getComision();
            SubastaEntity subasta = subastaRepository.findByCatalogoId(item.getCatalogo().getId()).orElse(null);
            if (subasta != null) {
                subastaInfo = new PropuestaDto.SubastaInfo(
                        subasta.getFecha() != null ? subasta.getFecha().toString() : null,
                        subasta.getHora() != null ? subasta.getHora().toString() : null,
                        subasta.getUbicacion());
            }
        }
        return new PropuestaDto(prod.getId(), prod.getEstado().name(),
                prod.getDescripcionCatalogo(), precioBase, comision, subastaInfo);
    }

    /** El dueno acepta las condiciones propuestas (RF flujo vendedor). */
    @Transactional
    public ProductoDto aceptarPropuesta(Long personaId, Long productoId) {
        ProductoEntity prod = findPropioDueno(personaId, productoId);
        exigirEstado(prod, EstadoProducto.propuesta_enviada);
        prod.setEstado(EstadoProducto.aceptado_por_usuario);
        productoRepository.save(prod);
        return toDto(prod);
    }

    /** El dueno rechaza las condiciones propuestas. */
    @Transactional
    public ProductoDto rechazarPropuesta(Long personaId, Long productoId) {
        ProductoEntity prod = findPropioDueno(personaId, productoId);
        exigirEstado(prod, EstadoProducto.propuesta_enviada);
        prod.setEstado(EstadoProducto.rechazado_por_usuario);
        productoRepository.save(prod);
        return toDto(prod);
    }

    private ProductoEntity findPropioDueno(Long personaId, Long productoId) {
        ProductoEntity prod = productoRepository.findById(productoId)
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + productoId));
        if (!prod.getDuenio().getId().equals(personaId)) {
            throw new ForbiddenException("El producto no pertenece al usuario autenticado.");
        }
        return prod;
    }

    private void exigirEstado(ProductoEntity prod, EstadoProducto esperado) {
        if (prod.getEstado() != esperado) {
            throw new UnprocessableEntityException(
                    "El producto no esta en estado " + esperado + " (estado actual: " + prod.getEstado() + ").");
        }
    }

    public ProductoDto toDto(ProductoEntity prod) {
        PersonaEntity duenioPersona = prod.getDuenio().getPersona();
        ProductoDto.DuenioDto duenioDto = new ProductoDto.DuenioDto(
                prod.getDuenio().getId(),
                duenioPersona != null ? duenioPersona.getNombre() : "Duenio " + prod.getDuenio().getId()
        );

        List<ProductoDto.FotoDto> fotos = fotoRepository.findByProductoId(prod.getId()).stream()
                .map(f -> new ProductoDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + prod.getId() + "/fotos/" + f.getId()))
                .toList();

        ProductoDto.SeguroDto seguroDto = null;
        if (prod.getSeguro() != null) {
            SeguroEntity seguro = prod.getSeguro();
            seguroDto = new ProductoDto.SeguroDto(seguro.getNroPoliza(),
                    seguro.getCompania(), seguro.getImporte());
        }

        return new ProductoDto(
                prod.getId(),
                prod.getDescripcionCatalogo(),
                prod.getDescripcionCompleta(),
                prod.getFecha() != null ? prod.getFecha().toString() : null,
                Boolean.TRUE.equals(prod.getDisponible()) ? "si" : "no",
                prod.getEstado() != null ? prod.getEstado().name() : null,
                duenioDto,
                fotos,
                seguroDto,
                buildSubastaResumen(prod.getId())
        );
    }

    /** Resumen de la subasta a la que quedo asignado el producto (null si aun no esta en un catalogo). */
    private ProductoDto.SubastaResumenDto buildSubastaResumen(Long productoId) {
        ItemCatalogoEntity item = itemCatalogoRepository.findByProductoId(productoId).orElse(null);
        if (item == null || item.getCatalogo() == null) {
            return null;
        }
        SubastaEntity subasta = subastaRepository.findByCatalogoId(item.getCatalogo().getId()).orElse(null);
        if (subasta == null) {
            return null;
        }
        return new ProductoDto.SubastaResumenDto(
                subasta.getId(),
                subasta.getEstado(),
                subasta.getFecha() != null ? subasta.getFecha().toString() : null,
                subasta.getHora() != null ? subasta.getHora().toString() : null,
                subasta.getCategoria(),
                item.getCatalogo().getId(),
                item.getId()
        );
    }
}
