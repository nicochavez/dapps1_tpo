package com.tpo.backend.catalogo.service;

import com.tpo.backend.catalogo.dto.CatalogoListDto;
import com.tpo.backend.catalogo.dto.CatalogoNewRequest;
import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.puja.entity.PujaEntity;
import com.tpo.backend.puja.repository.PujaRepository;
import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.empleado.repository.EmpleadoRepository;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CatalogoService {

    /** Minimo de imagenes por item de catalogo (RF-14). */
    private static final int MIN_FOTOS = 6;

    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemRepository;
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final ClienteService clienteService;
    private final EmpleadoRepository empleadoRepository;
    private final SubastaRepository subastaRepository;
    private final PujaRepository pujaRepository;

    public CatalogoService(CatalogoRepository catalogoRepository,
                           ItemCatalogoRepository itemRepository,
                           ProductoRepository productoRepository,
                           FotoRepository fotoRepository,
                           ClienteService clienteService,
                           EmpleadoRepository empleadoRepository,
                           SubastaRepository subastaRepository,
                           PujaRepository pujaRepository) {
        this.catalogoRepository = catalogoRepository;
        this.itemRepository = itemRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.clienteService = clienteService;
        this.empleadoRepository = empleadoRepository;
        this.subastaRepository = subastaRepository;
        this.pujaRepository = pujaRepository;
    }

    @Transactional
    public List<CatalogoListDto> listarTodos() {
        return catalogoRepository.findAll().stream()
                .map(this::toListDto)
                .toList();
    }

    @Transactional
    public List<CatalogoListDto> getCatalogosForSubasta(Long subastaId) {
        return subastaRepository.findById(subastaId)
                .filter(s -> s.getCatalogo() != null)
                .map(s -> List.of(toListDto(s.getCatalogo())))
                .orElse(List.of());
    }

    @Transactional
    public CatalogoListDto crearCatalogo(CatalogoNewRequest request) {
        EmpleadoEntity responsable = empleadoRepository.findById(request.getResponsable())
                .orElseThrow(() -> new ResourceNotFoundException("Empleado no encontrado: " + request.getResponsable()));
        CatalogoEntity entity = new CatalogoEntity();
        entity.setDescripcion(request.getDescripcion());
        entity.setResponsable(responsable);
        entity = catalogoRepository.save(entity);
        return toListDto(entity);
    }

    @Transactional
    public ItemCatalogoDetailDto getItemDetalle(Long catalogoId, Long itemId) {
        catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + catalogoId));
        ItemCatalogoEntity item = itemRepository.findById(itemId)
                .filter(i -> i.getCatalogo().getId().equals(catalogoId))
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));
        return toDetailDto(item);
    }

    @Transactional
    public List<CatalogoListDto.ItemDto> getItemsByCatalogo(Long subastaId, Long catalogoId) {
        catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + catalogoId));
        SubastaEntity subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        if (subasta.getCatalogo() == null || !subasta.getCatalogo().getId().equals(catalogoId)) {
            throw new ResourceNotFoundException("Catalogo no pertenece a subasta: " + subastaId);
        }
        boolean live = "abierta".equalsIgnoreCase(subasta.getEstado());
        List<ItemCatalogoEntity> items = itemRepository.findByCatalogoId(catalogoId);
        Long loteActual = currentLotId(items);
        return items.stream()
                .map(i -> toListItemDto(i, live, loteActual))
                .toList();
    }

    @Transactional
    public ItemCatalogoDetailDto crearItem(ItemCatalogoNewRequest request) {
        ProductoEntity producto = productoRepository.findById(request.getProducto())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + request.getProducto()));
        CatalogoEntity catalogo = catalogoRepository.findById(request.getCatalogo())
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + request.getCatalogo()));

        validarMinimoFotos(producto.getId());

        ItemCatalogoEntity item = new ItemCatalogoEntity();
        item.setCatalogo(catalogo);
        item.setProducto(producto);
        item.setPrecioBase(request.getPrecioBase());
        item.setComision(request.getComision());
        item.setSubastado(false);
        item = itemRepository.save(item);

        return toDetailDto(item);
    }

    /** RF-14: cada item debe tener al menos 6 imagenes. */
    private void validarMinimoFotos(Long productoId) {
        int cantidad = fotoRepository.findByProductoId(productoId).size();
        if (cantidad < MIN_FOTOS) {
            throw new UnprocessableEntityException(
                    "El producto debe tener al menos " + MIN_FOTOS + " imagenes (tiene " + cantidad + ").");
        }
    }

    @Transactional
    public List<ItemCatalogoDetailDto> getItemsByDuenio(Long userId) {
        List<Long> productosDelDuenio = productoRepository.findByDuenioId(userId).stream()
                .map(ProductoEntity::getId).toList();
        return itemRepository.findAll().stream()
                .filter(i -> productosDelDuenio.contains(i.getProducto().getId()))
                .map(this::toDetailDto)
                .toList();
    }

    private CatalogoListDto toListDto(CatalogoEntity cat) {
        SubastaEntity subasta = subastaRepository.findByCatalogoId(cat.getId()).orElse(null);
        boolean live = subasta != null && "abierta".equalsIgnoreCase(subasta.getEstado());
        List<ItemCatalogoEntity> itemEntities = itemRepository.findByCatalogoId(cat.getId());
        Long loteActual = currentLotId(itemEntities);

        List<CatalogoListDto.ItemDto> items = itemEntities.stream()
                .map(i -> toListItemDto(i, live, loteActual))
                .toList();

        // Portada e itemCategory derivados del primer item del catalogo.
        String image = items.isEmpty() ? null : items.get(0).getImagenPrincipal();
        String itemCategory = itemEntities.isEmpty() || itemEntities.get(0).getProducto() == null
                ? null : itemEntities.get(0).getProducto().getCategoria();

        CatalogoListDto.SubastaResumenDto subastaDto = subasta == null ? null
                : new CatalogoListDto.SubastaResumenDto(
                        subasta.getId(),
                        subasta.getEstado(),
                        subasta.getCategoria(),
                        subasta.getFecha() != null ? subasta.getFecha().toString() : null,
                        subasta.getHora() != null ? subasta.getHora().toString() : null);

        return new CatalogoListDto(cat.getId(), cat.getDescripcion(), items.size(),
                image, itemCategory, subastaDto, items);
    }

    /**
     * Lote actual = primer item no subastado (menor id), mismo criterio que
     * {@code AdjudicacionService.currentItem}. La subasta avanza por lotes: solo
     * uno puede estar en puja a la vez.
     */
    private Long currentLotId(List<ItemCatalogoEntity> items) {
        return items.stream()
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .map(ItemCatalogoEntity::getId)
                .min(Long::compareTo)
                .orElse(null);
    }

    private CatalogoListDto.ItemDto toListItemDto(ItemCatalogoEntity item, boolean live, Long loteActual) {
        ProductoEntity prod = item.getProducto();
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";
        var fotos = fotoRepository.findByProductoId(item.getProducto().getId());
        String imagenPrincipal = fotos.isEmpty() ? null
                : "/api/v1/productos/" + item.getProducto().getId() + "/fotos/" + fotos.get(0).getId();

        boolean subastado = Boolean.TRUE.equals(item.getSubastado());
        BigDecimal mejorOferta = pujaRepository.findFirstByItemIdOrderByImporteDesc(item.getId())
                .map(PujaEntity::getImporte)
                .orElse(null);

        // Solo el lote actual de una subasta abierta esta "en puja"; el resto espera su turno.
        String estadoLote = subastado ? "subastado"
                : (live && item.getId().equals(loteActual)) ? "en_puja"
                : "pendiente";

        return new CatalogoListDto.ItemDto(
                item.getId(),
                descripcion,
                precioVisible(item.getPrecioBase()),
                subastado ? "si" : "no",
                imagenPrincipal,
                item.getNumeroPieza(),
                item.getComision(),
                precioVisible(mejorOferta),
                subastado ? precioVisible(mejorOferta) : null,
                estadoLote
        );
    }

    private ItemCatalogoDetailDto toDetailDto(ItemCatalogoEntity item) {
        ProductoEntity producto = item.getProducto();
        List<ItemCatalogoDetailDto.FotoDto> fotos = fotoRepository.findByProductoId(producto.getId()).stream()
                .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + producto.getId() + "/fotos/" + f.getId()))
                .toList();

        // Mismo estado del lote que en el listado, para que ambas vistas sean consistentes.
        Long catalogoId = item.getCatalogo() != null ? item.getCatalogo().getId() : null;
        SubastaEntity subasta = catalogoId != null ? subastaRepository.findByCatalogoId(catalogoId).orElse(null) : null;
        boolean live = subasta != null && "abierta".equalsIgnoreCase(subasta.getEstado());
        Long loteActual = catalogoId != null ? currentLotId(itemRepository.findByCatalogoId(catalogoId)) : null;
        boolean subastado = Boolean.TRUE.equals(item.getSubastado());
        String estadoLote = subastado ? "subastado"
                : (live && item.getId().equals(loteActual)) ? "en_puja"
                : "pendiente";

        return new ItemCatalogoDetailDto(
                item.getId(),
                precioVisible(item.getPrecioBase()),
                item.getComision(),
                subastado ? "si" : "no",
                estadoLote,
                new ItemCatalogoDetailDto.ProductoRefDto(producto.getId(),
                        producto.getDuenio() != null ? producto.getDuenio().getId() : null,
                        producto.getDescripcionCatalogo(), producto.getDescripcionCompleta(),
                        producto.getArtista(),
                        producto.getFecha() != null ? producto.getFecha().toString() : null,
                        producto.getResenia(),
                        fotos)
        );
    }

    /** RF-13: el precio base solo es visible para usuarios registrados. */
    private java.math.BigDecimal precioVisible(java.math.BigDecimal precioBase) {
        return clienteService.isAuthenticated() ? precioBase : null;
    }
}
