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
import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.empleado.repository.EmpleadoRepository;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

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

    public CatalogoService(CatalogoRepository catalogoRepository,
                           ItemCatalogoRepository itemRepository,
                           ProductoRepository productoRepository,
                           FotoRepository fotoRepository,
                           ClienteService clienteService,
                           EmpleadoRepository empleadoRepository,
                           SubastaRepository subastaRepository) {
        this.catalogoRepository = catalogoRepository;
        this.itemRepository = itemRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.clienteService = clienteService;
        this.empleadoRepository = empleadoRepository;
        this.subastaRepository = subastaRepository;
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
        return itemRepository.findByCatalogoId(catalogoId).stream()
                .map(this::toListItemDto)
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
        List<CatalogoListDto.ItemDto> items = itemRepository.findByCatalogoId(cat.getId()).stream()
                .map(this::toListItemDto)
                .toList();
        return new CatalogoListDto(cat.getId(), cat.getDescripcion(), items.size(), items);
    }

    private CatalogoListDto.ItemDto toListItemDto(ItemCatalogoEntity item) {
        ProductoEntity prod = item.getProducto();
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";
        var fotos = fotoRepository.findByProductoId(item.getProducto().getId());
        String imagenPrincipal = fotos.isEmpty() ? null
                : "/api/v1/productos/" + item.getProducto().getId() + "/fotos/" + fotos.get(0).getId();
        return new CatalogoListDto.ItemDto(
                item.getId(),
                descripcion,
                precioVisible(item.getPrecioBase()),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                imagenPrincipal
        );
    }

    private ItemCatalogoDetailDto toDetailDto(ItemCatalogoEntity item) {
        ProductoEntity producto = item.getProducto();
        List<ItemCatalogoDetailDto.FotoDto> fotos = fotoRepository.findByProductoId(producto.getId()).stream()
                .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + producto.getId() + "/fotos/" + f.getId()))
                .toList();
        return new ItemCatalogoDetailDto(
                item.getId(),
                precioVisible(item.getPrecioBase()),
                item.getComision(),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                new ItemCatalogoDetailDto.ProductoRefDto(producto.getId(),
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
