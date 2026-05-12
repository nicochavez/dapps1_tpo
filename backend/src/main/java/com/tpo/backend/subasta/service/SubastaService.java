package com.tpo.backend.subasta.service;

import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ForbiddenException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
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
    private final PersonaRepository personaRepository;
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
                          PersonaRepository personaRepository,
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
        this.personaRepository = personaRepository;
        this.medioPagoRepository = medioPagoRepository;
        this.pujaRepository = pujaRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public PagedResponse<SubastaListItemDto> listar(String estado, String categoria, String fecha,
                                                     String moneda, int page, int size) {
        List<SubastaEntity> all = subastaRepository.findAll();
        List<SubastaListItemDto> filtered = all.stream()
                .filter(s -> estado == null || (s.getEstado() != null && s.getEstado().equalsIgnoreCase(estado)))
                .filter(s -> categoria == null || (s.getCategoria() != null && s.getCategoria().equalsIgnoreCase(categoria)))
                .filter(s -> fecha == null || (s.getFecha() != null && s.getFecha().toString().equals(fecha)))
                .filter(s -> moneda == null || (s.getMoneda() != null && s.getMoneda().equalsIgnoreCase(moneda)))
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
        CatalogoDto catalogo = buildCatalogoDto(s.getId());
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
        s.setEstado("abierta");
        s.setUbicacion(request.getUbicacion());
        s.setCapacidadAsistentes(request.getCapacidadAsistentes());
        s.setTieneDeposito(request.getTieneDeposito());
        s.setSeguridadPropia(request.getSeguridadPropia());
        s.setCategoria(request.getCategoria());
        s.setMoneda(request.getMoneda() != null ? request.getMoneda() : "ARS");
        s.setSubastador(request.getSubastador());
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
        SubastaEntity subasta = findOrThrow(subastaId);
        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new ConflictException("La subasta no esta abierta.");
        }

        Long clienteId = clienteService.currentClienteEntity().getId();

        boolean elsewhere = asistenteRepository.findByCliente(clienteId).stream()
                .anyMatch(a -> !a.getSubasta().equals(subastaId));
        if (elsewhere) throw new ForbiddenException("Ya esta conectado a otra subasta.");

        boolean hasVerified = medioPagoRepository.findByCliente(clienteId).stream()
                .anyMatch(m -> Boolean.TRUE.equals(m.getVerificado()));
        if (!hasVerified) throw new ForbiddenException("No tiene medio de pago verificado.");

        AsistenteEntity asistente = asistenteRepository.findBySubastaAndCliente(subastaId, clienteId)
                .orElseGet(() -> {
                    AsistenteEntity a = new AsistenteEntity();
                    a.setSubasta(subastaId);
                    a.setCliente(clienteId);
                    a.setNumeroPostor((int) (100 + asistenteRepository.countBySubasta(subastaId) + 1));
                    return asistenteRepository.save(a);
                });

        return new ConectarResponse(new AsistenteDto(asistente.getCliente(), asistente.getNumeroPostor()));
    }

    @Transactional
    public void desconectar(Long subastaId) {
        findOrThrow(subastaId);
        Long clienteId = clienteService.currentClienteEntity().getId();
        asistenteRepository.findBySubastaAndCliente(subastaId, clienteId)
                .ifPresent(asistenteRepository::delete);
    }

    @Transactional
    public ItemActualDto getItemActual(Long subastaId) {
        findOrThrow(subastaId);

        List<CatalogoEntity> catalogos = catalogoRepository.findBySubasta(subastaId);
        ItemCatalogoEntity item = catalogos.stream()
                .flatMap(c -> itemRepository.findByCatalogo(c.getId()).stream())
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No hay item activo en esta subasta."));

        List<FotoRefDto> imagenes = buildFotoRefs(item.getProducto());
        ProductoEntity prod = productoRepository.findById(item.getProducto()).orElse(null);
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";

        var topPuja = pujaRepository.findFirstByItemOrderByImporteDesc(item.getId()).orElse(null);
        java.math.BigDecimal mejorOferta = topPuja != null ? topPuja.getImporte() : item.getPrecioBase();
        Integer numeroPostor = null;
        if (topPuja != null) {
            numeroPostor = asistenteRepository.findById(topPuja.getAsistente())
                    .map(AsistenteEntity::getNumeroPostor)
                    .orElse(null);
        }

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

        ItemCatalogoEntity item = new ItemCatalogoEntity();
        item.setCatalogo(catalogo.getId());
        item.setProducto(producto.getId());
        item.setPrecioBase(request.getPrecioBase());
        item.setComision(request.getComision());
        item.setSubastado(false);
        item = itemRepository.save(item);

        List<ItemCatalogoDetailDto.FotoDto> fotos = fotoRepository.findByProducto(producto.getId()).stream()
                .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + producto.getId() + "/fotos/" + f.getId()))
                .toList();
        return new ItemCatalogoDetailDto(item.getId(), item.getPrecioBase(), item.getComision(), "no",
                new ItemCatalogoDetailDto.ProductoRefDto(producto.getId(),
                        producto.getDescripcionCatalogo(), producto.getDescripcionCompleta(), fotos));
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
        List<Long> productosDuenio = productoRepository.findByDuenio(userId).stream()
                .map(ProductoEntity::getId).toList();
        return subastaRepository.findAll().stream()
                .filter(s -> catalogoRepository.findBySubasta(s.getId()).stream()
                        .flatMap(c -> itemRepository.findByCatalogo(c.getId()).stream())
                        .anyMatch(i -> productosDuenio.contains(i.getProducto())))
                .map(this::toListItemDto)
                .toList();
    }

    @Transactional
    public List<SubastaListItemDto> getByCliente(Long userId) {
        return asistenteRepository.findByCliente(userId).stream()
                .map(a -> subastaRepository.findById(a.getSubasta()).orElse(null))
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
                toSubastadorDto(s.getSubastador())
        );
    }

    private SubastadorDto toSubastadorDto(Long subastadorId) {
        if (subastadorId == null) return null;
        SubastadorEntity entity = subastadorRepository.findById(subastadorId).orElse(null);
        if (entity == null) return null;
        PersonaEntity persona = personaRepository.findById(subastadorId).orElse(null);
        String nombre = persona != null ? persona.getNombre() : "Subastador " + subastadorId;
        return new SubastadorDto(entity.getId(), nombre, entity.getMatricula());
    }

    private CatalogoDto buildCatalogoDto(Long subastaId) {
        List<CatalogoEntity> catalogos = catalogoRepository.findBySubasta(subastaId);
        if (catalogos.isEmpty()) return null;
        CatalogoEntity first = catalogos.get(0);
        List<ItemCatalogoDto> items = itemRepository.findByCatalogo(first.getId()).stream()
                .sorted(Comparator.comparing(ItemCatalogoEntity::getId))
                .map(this::toItemDto)
                .toList();
        return new CatalogoDto(first.getId(), first.getDescripcion(), items);
    }

    private ItemCatalogoDto toItemDto(ItemCatalogoEntity item) {
        ProductoEntity prod = productoRepository.findById(item.getProducto()).orElse(null);
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";
        return new ItemCatalogoDto(
                item.getId(),
                item.getNumeroPieza(),
                descripcion,
                item.getPrecioBase(),
                item.getComision(),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                buildFotoRefs(item.getProducto())
        );
    }

    private List<FotoRefDto> buildFotoRefs(Long productoId) {
        return fotoRepository.findByProducto(productoId).stream()
                .map(f -> new FotoRefDto(f.getId(),
                        "/api/v1/productos/" + productoId + "/fotos/" + f.getId()))
                .toList();
    }
}
