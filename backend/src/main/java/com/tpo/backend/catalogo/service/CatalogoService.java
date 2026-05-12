package com.tpo.backend.catalogo.service;

import com.tpo.backend.catalogo.dto.CatalogoListDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CatalogoService {

    private final CatalogoRepository catalogoRepository;
    private final ItemCatalogoRepository itemRepository;
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;

    public CatalogoService(CatalogoRepository catalogoRepository,
                           ItemCatalogoRepository itemRepository,
                           ProductoRepository productoRepository,
                           FotoRepository fotoRepository) {
        this.catalogoRepository = catalogoRepository;
        this.itemRepository = itemRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
    }

    @Transactional
    public List<CatalogoListDto> listarTodos() {
        return catalogoRepository.findAll().stream()
                .map(this::toListDto)
                .toList();
    }

    @Transactional
    public List<CatalogoListDto> getCatalogosForSubasta(Long subastaId) {
        return catalogoRepository.findBySubasta(subastaId).stream()
                .map(this::toListDto)
                .toList();
    }

    @Transactional
    public ItemCatalogoDetailDto getItemDetalle(Long catalogoId, Long itemId) {
        catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + catalogoId));
        ItemCatalogoEntity item = itemRepository.findById(itemId)
                .filter(i -> i.getCatalogo().equals(catalogoId))
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));
        return toDetailDto(item);
    }

    @Transactional
    public List<CatalogoListDto.ItemDto> getItemsByCatalogo(Long subastaId, Long catalogoId) {
        CatalogoEntity cat = catalogoRepository.findById(catalogoId)
                .orElseThrow(() -> new ResourceNotFoundException("Catalogo no encontrado: " + catalogoId));
        if (cat.getSubasta() == null || !cat.getSubasta().equals(subastaId)) {
            throw new ResourceNotFoundException("Catalogo no pertenece a subasta: " + subastaId);
        }
        return itemRepository.findByCatalogo(catalogoId).stream()
                .map(this::toListItemDto)
                .toList();
    }

    @Transactional
    public ItemCatalogoDetailDto crearItem(ItemCatalogoNewRequest request) {
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

        return toDetailDto(item);
    }

    @Transactional
    public List<ItemCatalogoDetailDto> getItemsByDuenio(Long userId) {
        List<Long> productosDelDuenio = productoRepository.findByDuenio(userId).stream()
                .map(ProductoEntity::getId).toList();
        return itemRepository.findAll().stream()
                .filter(i -> productosDelDuenio.contains(i.getProducto()))
                .map(this::toDetailDto)
                .toList();
    }

    private CatalogoListDto toListDto(CatalogoEntity cat) {
        List<CatalogoListDto.ItemDto> items = itemRepository.findByCatalogo(cat.getId()).stream()
                .map(this::toListItemDto)
                .toList();
        return new CatalogoListDto(cat.getId(), cat.getDescripcion(), items.size(), items);
    }

    private CatalogoListDto.ItemDto toListItemDto(ItemCatalogoEntity item) {
        ProductoEntity prod = productoRepository.findById(item.getProducto()).orElse(null);
        String descripcion = prod != null ? prod.getDescripcionCatalogo() : "";
        var fotos = fotoRepository.findByProducto(item.getProducto());
        String imagenPrincipal = fotos.isEmpty() ? null
                : "/api/v1/productos/" + item.getProducto() + "/fotos/" + fotos.get(0).getId();
        return new CatalogoListDto.ItemDto(
                item.getId(),
                descripcion,
                item.getPrecioBase(),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                imagenPrincipal
        );
    }

    private ItemCatalogoDetailDto toDetailDto(ItemCatalogoEntity item) {
        ProductoEntity producto = productoRepository.findById(item.getProducto())
                .orElseThrow(() -> new ResourceNotFoundException("Producto no encontrado: " + item.getProducto()));
        List<ItemCatalogoDetailDto.FotoDto> fotos = fotoRepository.findByProducto(producto.getId()).stream()
                .map(f -> new ItemCatalogoDetailDto.FotoDto(f.getId(),
                        "/api/v1/productos/" + producto.getId() + "/fotos/" + f.getId()))
                .toList();
        return new ItemCatalogoDetailDto(
                item.getId(),
                item.getPrecioBase(),
                item.getComision(),
                Boolean.TRUE.equals(item.getSubastado()) ? "si" : "no",
                new ItemCatalogoDetailDto.ProductoRefDto(producto.getId(),
                        producto.getDescripcionCatalogo(), producto.getDescripcionCompleta(), fotos)
        );
    }
}
