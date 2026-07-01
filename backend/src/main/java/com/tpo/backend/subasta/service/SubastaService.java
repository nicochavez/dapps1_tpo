package com.tpo.backend.subasta.service;

import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ForbiddenException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.common.util.CategoriaUtil;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.producto.entity.FotoEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.puja.entity.PujaEntity;
import com.tpo.backend.puja.repository.PujaRepository;
import com.tpo.backend.subasta.dto.*;
import com.tpo.backend.subasta.entity.AsistenteEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.entity.SubastadorEntity;
import com.tpo.backend.subasta.repository.AsistenteRepository;
import com.tpo.backend.subasta.repository.SubastaRepository;
import com.tpo.backend.subasta.repository.SubastadorRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;

@Service
public class SubastaService {

    private final SubastaRepository subastaRepository;
    private final SubastadorRepository subastadorRepository;
    private final AsistenteRepository asistenteRepository;
    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemRepository;
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final PujaRepository pujaRepository;
    private final ClienteService clienteService;

    public SubastaService(SubastaRepository subastaRepository,
                          SubastadorRepository subastadorRepository,
                          AsistenteRepository asistenteRepository,
                          CatalogoRepository catalogoRepository,
                          ItemCatalogoRepository itemRepository,
                          ProductoRepository productoRepository,
                          FotoRepository fotoRepository,
                          MedioPagoRepository medioPagoRepository,
                          PujaRepository pujaRepository,
                          ClienteService clienteService) {
        this.subastaRepository = subastaRepository;
        this.subastadorRepository = subastadorRepository;
        this.asistenteRepository = asistenteRepository;
        this.catalogoRepository = catalogoRepository;
        this.itemRepository = itemRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.medioPagoRepository = medioPagoRepository;
        this.pujaRepository = pujaRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public PagedResponse<SubastaListItemDto> listar(String estado, String categoria, String fecha,
                                                     String moneda, int page, int size) {
        // RF-20: si hay usuario autenticado, solo ve subastas de su categoria o inferiores.
        ClienteEntity actual = clienteService.currentClienteOrNull();
        String categoriaUsuario = actual != null ? actual.getCategoria() : null;

        List<SubastaEntity> all = subastaRepository.findAll();
        List<SubastaListItemDto> filtered = all.stream()
                .filter(s -> estado == null || (s.getEstado() != null && s.getEstado().equalsIgnoreCase(estado)))
                .filter(s -> categoria == null || (s.getCategoria() != null && s.getCategoria().equalsIgnoreCase(categoria)))
                .filter(s -> fecha == null || (s.getFecha() != null && s.getFecha().toString().equals(fecha)))
                .filter(s -> moneda == null || (s.getMoneda() != null && s.getMoneda().equalsIgnoreCase(moneda)))
                .filter(s -> categoriaUsuario == null || CategoriaUtil.puedeAcceder(categoriaUsuario, s.getCategoria()))
                .map(this::toListItemDto)
                .toList();

        int total = filtered.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 0;
        return new PagedResponse<>(filtered.subList(from, to), totalPages, total, page, size);
    }

    @Transactional
    public SubastaDetailDto getById(Long id) {
        SubastaEntity s = findOrThrow(id);
        CatalogoDto catalogo = buildCatalogoDto(s);
        return new SubastaDetailDto(
                s.getId(),
                s.getFecha() != null ? s.getFecha().toString() : null,
                s.getHora() != null ? s.getHora().toString() : null,
                s.getEstado(),
                s.getUbicacion(),
                s.getCategoria(),
                s.getMoneda(),
                s.getCapacidadAsistentes(),
                s.getTieneDeposito(),
                s.getSeguridadPropia(),
                toSubastadorDto(s.getSubastador()),
                catalogo
        );
    }

    @Transactional
    public SubastaDetailDto crear(SubastaNewRequest request) {
        SubastaEntity s = new SubastaEntity();
        s.setFecha(request.getFecha() != null ? LocalDate.parse(request.getFecha()) : null);
        s.setHora(LocalTime.parse(request.getHora()));
        s.setEstado("programada");
        s.setUbicacion(request.getUbicacion());
        s.setCapacidadAsistentes(request.getCapacidadAsistentes());
        s.setTieneDeposito(request.getTieneDeposito());
        s.setSeguridadPropia(request.getSeguridadPropia());
        s.setCategoria(request.getCategoria());
        s.setMoneda(request.getMoneda() != null ? request.getMoneda() : "ARS");
        if (request.getSubastador() != null) {
            s.setSubastador(subastadorRepository.findById(request.getSubastador())
                    .orElseThrow(() -> new ResourceNotFoundException("Subastador no encontrado: " + request.getSubastador())));
        }
        if (request.getCatalogo() != null) {
            s.setCatalogo(catalogoRepository.findById(request.getCatalogo())
                    .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + request.getCatalogo())));
        }
        s = subastaRepository.save(s);
        return getById(s.getId());
    }

    @Transactional
    public void actualizar(Long id, SubastaUpdateRequest request) {
        SubastaEntity s = findOrThrow(id);
        if (request.getFecha() != null) s.setFecha(LocalDate.parse(request.getFecha()));
        if (request.getHora() != null) s.setHora(LocalTime.parse(request.getHora()));
        if (request.getUbicacion() != null) s.setUbicacion(request.getUbicacion());
        if (request.getEstado() != null) s.setEstado(request.getEstado());
        if (request.getCapacidadAsistentes() != null) s.setCapacidadAsistentes(request.getCapacidadAsistentes());
        subastaRepository.save(s);
    }

    @Transactional
    public ConectarResponse conectar(Long subastaId) {
        return conectar(subastaId, false);
    }

    /**
     * Conecta al cliente a la subasta.
     * @param espectador si true, ingresa como espectador (RF-21): no requiere medio de pago verificado
     *                   pero tampoco podra pujar; si false, ingresa como postor (RF-22).
     */
    @Transactional
    public ConectarResponse conectar(Long subastaId, boolean espectador) {
        SubastaEntity subasta = findOrThrow(subastaId);

        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new ConflictException("La subasta no esta abierta.");
        }

        var cliente = clienteService.currentClienteEntity();

        if (!Boolean.TRUE.equals(cliente.getAdmitido())) {
            throw new ForbiddenException("El cliente todavia no fue aprobado por la empresa.");
        }

        Long clienteId = cliente.getId();

        boolean elsewhere = asistenteRepository.findByClienteId(clienteId).stream()
                .anyMatch(a -> !a.getSubasta().getId().equals(subastaId));

        if (elsewhere) throw new ConflictException("Ya esta conectado a otra subasta.");

        // RF-22: para pujar (no espectador) hace falta medio de pago verificado.
        if (!espectador) {
            boolean hasVerified = medioPagoRepository.findByClienteId(clienteId).stream()
                    .anyMatch(m -> Boolean.TRUE.equals(m.getVerificado()));
            if (!hasVerified) throw new ForbiddenException("No tiene medio de pago verificado.");
        }

        AsistenteEntity asistente = asistenteRepository.findBySubastaIdAndClienteId(subastaId, clienteId)
                .orElseGet(() -> {
                    AsistenteEntity a = new AsistenteEntity();
                    a.setSubasta(subasta);
                    a.setCliente(cliente);
                    a.setNumeroPostor((int) (100 + asistenteRepository.countBySubastaId(subastaId) + 1));
                    a.setEspectador(espectador);
                    return asistenteRepository.save(a);
                });

        // Permite promover de espectador a postor al reconectar con medio de pago verificado.
        if (!espectador && Boolean.TRUE.equals(asistente.getEspectador())) {
            asistente.setEspectador(false);
            asistente = asistenteRepository.save(asistente);
        }

        return new ConectarResponse(new AsistenteDto(asistente.getCliente().getId(), asistente.getNumeroPostor()));
    }
    @Transactional
    public void desconectar(Long subastaId) {
        findOrThrow(subastaId);
        Long clienteId = clienteService.currentClienteEntity().getId();
        asistenteRepository.findBySubastaIdAndClienteId(subastaId, clienteId)
                .ifPresent(asistenteRepository::delete);
    }

    @Transactional
    public ItemActualDto getItemActual(Long subastaId) {
        SubastaEntity subasta = findOrThrow(subastaId);
        if (subasta.getCatalogo() == null) {
            throw new ResourceNotFoundException("No hay item activo en esta subasta.");
        }
        ItemCatalogoEntity item = itemRepository.findByCatalogoId(subasta.getCatalogo().getId()).stream()
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No hay item activo en esta subasta."));

        List<FotoRefDto> imagenes = buildFotoRefs(item.getProducto().getId());
        ProductoEntity prod = item.getProducto();
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";

        var topPuja = pujaRepository.findFirstByItemIdOrderByImporteDesc(item.getId()).orElse(null);
        java.math.BigDecimal mejorOferta = topPuja != null ? topPuja.getImporte() : item.getPrecioBase();
        Integer numeroPostor = topPuja != null ? topPuja.getAsistente().getNumeroPostor() : null;

        return new ItemActualDto(
                new ItemActualDto.ItemInfoDto(item.getId(), descripcion, item.getPrecioBase(), imagenes),
                new ItemActualDto.MejorOfertaDto(mejorOferta, numeroPostor));
    }

    @Transactional
    public ItemCatalogoDetailDto addItem(Long subastaId, ItemCatalogoNewRequest request) {
        findOrThrow(subastaId);
        ProductoEntity producto = productoRepository.findById(request.getProducto())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + request.getProducto()));

        CatalogoEntity catalogo = catalogoRepository.findById(request.getCatalogo())
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + request.getCatalogo()));

        // RF-14: el item debe tener al menos 6 imagenes.
        int cantidadFotos = fotoRepository.findByProductoId(producto.getId()).size();
        if (cantidadFotos < 6) {
            throw new UnprocessableEntityException(
                    "El producto debe tener al menos 6 imagenes (tiene " + cantidadFotos + ").");
        }

        ItemCatalogoEntity item = new ItemCatalogoEntity();
        item.setCatalogo(catalogo);
        item.setProducto(producto);
        item.setPrecioBase(request.getPrecioBase());
        item.setComision(request.getComision());
        item.setSubastado(false);
        item = itemRepository.save(item);

        List<ItemCatalogoDetailDto.FotoDto> fotos = fotoRepository.findByProductoId(producto.getId()).stream()
                .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + producto.getId() + "/fotos/" + f.getId()))
                .toList();
        return new ItemCatalogoDetailDto(item.getId(), item.getPrecioBase(), item.getComision(), "no", "pendiente", null,
                new ItemCatalogoDetailDto.ProductoRefDto(producto.getId(),
                        producto.getDuenio() != null ? producto.getDuenio().getId() : null,
                        producto.getDescripcionCatalogo(), producto.getDescripcionCompleta(),
                        producto.getArtista(),
                        producto.getFecha() != null ? producto.getFecha().toString() : null,
                        producto.getResenia(),
                        fotos));
    }

    @Transactional
    public void removeItem(Long subastaId, Long itemId) {
        findOrThrow(subastaId);
        ItemCatalogoEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));
        itemRepository.delete(item);
    }

    @Transactional
    public List<SubastaListItemDto> getByDuenio(Long userId) {
        List<Long> productosDuenio = productoRepository.findByDuenioId(userId).stream()
                .map(ProductoEntity::getId).toList();
        return subastaRepository.findAll().stream()
                .filter(s -> s.getCatalogo() != null &&
                        itemRepository.findByCatalogoId(s.getCatalogo().getId()).stream()
                                .anyMatch(i -> productosDuenio.contains(i.getProducto().getId())))
                .map(this::toListItemDto)
                .toList();
    }

    @Transactional
    public List<SubastaListItemDto> getByCliente(Long userId) {
        return asistenteRepository.findByClienteId(userId).stream()
                .map(AsistenteEntity::getSubasta)
                .filter(java.util.Objects::nonNull)
                .map(this::toListItemDto)
                .toList();
    }

    @Transactional
    public List<SubastaListItemDto> getSubastas() {
        return subastaRepository.findAll().stream().map(this::toListItemDto).toList();
    }

    public SubastaEntity findOrThrow(Long subastaId) {
        return subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
    }

    private SubastaListItemDto toListItemDto(SubastaEntity s) {
        return new SubastaListItemDto(
                s.getId(),
                s.getFecha() != null ? s.getFecha().toString() : null,
                s.getHora() != null ? s.getHora().toString() : null,
                s.getEstado(),
                s.getUbicacion(),
                s.getCategoria(),
                s.getMoneda(),
                toSubastadorDto(s.getSubastador()),
                buildCatalogoDto(s)
        );
    }

    private SubastadorDto toSubastadorDto(SubastadorEntity entity) {
        if (entity == null) return null;
        PersonaEntity persona = entity.getPersona();
        String nombre = persona != null ? persona.getNombre() : "Subastador " + entity.getId();
        return new SubastadorDto(entity.getId(), nombre, entity.getMatricula());
    }

    private CatalogoDto buildCatalogoDto(SubastaEntity subasta) {
        if (subasta.getCatalogo() == null) return null;
        CatalogoEntity cat = subasta.getCatalogo();
        List<ItemCatalogoDto> items = itemRepository.findByCatalogoId(cat.getId()).stream()
                .sorted(Comparator.comparing(ItemCatalogoEntity::getId))
                .map(this::toItemDto)
                .toList();
        return new CatalogoDto(cat.getId(), cat.getDescripcion(), items);
    }

    private ItemCatalogoDto toItemDto(ItemCatalogoEntity item) {
        ProductoEntity prod = item.getProducto();
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";
        return new ItemCatalogoDto(
                item.getId(),
                item.getNumeroPieza(),
                descripcion,
                // RF-13: el precio base solo es visible para usuarios registrados.
                clienteService.isAuthenticated() ? item.getPrecioBase() : null,
                item.getComision(),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                buildFotoRefs(item.getProducto().getId())
        );
    }

    private List<FotoRefDto> buildFotoRefs(Long productoId) {
        return fotoRepository.findByProductoId(productoId).stream()
                .map(f -> new FotoRefDto(f.getId(),
                        "/api/v1/productos/" + productoId + "/fotos/" + f.getId()))
                .toList();
    }
}
