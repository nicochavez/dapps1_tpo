package com.tpo.backend.compra.service;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.compra.dto.CompraDto;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.historial.dto.HistorialSubastaDto;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.RegistroDeSubastaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final ItemCatalogoRepository itemRepository;
    private final ClienteService clienteService;

    public CompraService(CompraRepository compraRepository,
                         RegistroDeSubastaRepository registroRepository,
                         ItemCatalogoRepository itemRepository,
                         ClienteService clienteService) {
        this.compraRepository = compraRepository;
        this.registroRepository = registroRepository;
        this.itemRepository = itemRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public PagedResponse<CompraDto> listar(int page, int size) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        Page<CompraEntity> p = compraRepository.findByClienteId(clienteId, PageRequest.of(page, size));
        List<CompraDto> content = p.stream().map(this::toDto).toList();
        return new PagedResponse<>(content, p.getTotalPages(), (int) p.getTotalElements(), page, size);
    }

    @Transactional
    public CompraDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public void setRetiroPersonal(Long id) {
        CompraEntity compra = findOrThrow(id);
        compra.setRetiroPersonal(true);
        compraRepository.save(compra);
    }

    /** Marca la compra como pagada (RF pago del ganador). */
    @Transactional
    public void pagar(Long id) {
        CompraEntity compra = findOrThrow(id);
        compra.setEstadoPago("pagado");
        compraRepository.save(compra);
    }

    @Transactional
    public PagedResponse<HistorialSubastaDto> getHistorial(int page, int size) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        List<HistorialSubastaDto> all = registroRepository.findByClienteId(clienteId).stream()
                .map(r -> {
                    SubastaEntity s = r.getSubasta();
                    return new HistorialSubastaDto(
                            s.getId(),
                            s.getFecha() != null ? s.getFecha().toString() : null,
                            s.getCategoria(),
                            s.getEstado(),
                            1,
                            r.getImporte()
                    );
                })
                .toList();
        int total = all.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        int totalPages = size > 0 ? (int) Math.ceil((double) total / size) : 0;
        return new PagedResponse<>(all.subList(from, to), totalPages, total, page, size);
    }

    private CompraEntity findOrThrow(Long id) {
        return compraRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada: " + id));
    }

    private CompraDto toDto(CompraEntity compra) {
        SubastaEntity s = compra.getSubasta();
        ProductoEntity p = compra.getProducto();

        // Item de catálogo del producto, para poder abrir su detalle si ya está pagado.
        ItemCatalogoEntity item = itemRepository.findByProductoId(p.getId()).orElse(null);
        Long catalogoId = item != null && item.getCatalogo() != null ? item.getCatalogo().getId() : null;
        Long itemId = item != null ? item.getId() : null;

        return new CompraDto(
                compra.getId(),
                new CompraDto.SubastaRefDto(s.getId(),
                        s.getFecha() != null ? s.getFecha().toString() : null),
                new CompraDto.ProductoRefDto(p.getId(), p.getDescripcionCatalogo()),
                compra.getImporte(),
                compra.getComision(),
                compra.getCostoEnvio() != null ? compra.getCostoEnvio() : BigDecimal.ZERO,
                compra.getTotal(),
                Boolean.TRUE.equals(compra.getRetiroPersonal()),
                compra.getEstadoPago() != null ? compra.getEstadoPago() : "pendiente",
                catalogoId,
                itemId
        );
    }
}
