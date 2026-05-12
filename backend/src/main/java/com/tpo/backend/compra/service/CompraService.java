package com.tpo.backend.compra.service;

import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.compra.dto.CompraDto;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.historial.dto.HistorialSubastaDto;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.RegistroDeSubastaRepository;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class CompraService {

    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final SubastaRepository subastaRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final ClienteService clienteService;

    public CompraService(CompraRepository compraRepository,
                         ProductoRepository productoRepository,
                         SubastaRepository subastaRepository,
                         RegistroDeSubastaRepository registroRepository,
                         ClienteService clienteService) {
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.subastaRepository = subastaRepository;
        this.registroRepository = registroRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public PagedResponse<CompraDto> listar(int page, int size) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        Page<CompraEntity> p = compraRepository.findByCliente(clienteId, PageRequest.of(page, size));
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

    @Transactional
    public PagedResponse<HistorialSubastaDto> getHistorial(int page, int size) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        List<HistorialSubastaDto> all = registroRepository.findByCliente(clienteId).stream()
                .map(r -> {
                    SubastaEntity s = subastaRepository.findById(r.getSubasta()).orElse(null);
                    return new HistorialSubastaDto(
                            r.getSubasta(),
                            s != null && s.getFecha() != null ? s.getFecha().toString() : null,
                            s != null ? s.getCategoria() : null,
                            s != null ? s.getEstado() : null,
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
        SubastaEntity s = subastaRepository.findById(compra.getSubasta()).orElse(null);
        ProductoEntity p = productoRepository.findById(compra.getProducto()).orElse(null);
        return new CompraDto(
                compra.getId(),
                new CompraDto.SubastaRefDto(compra.getSubasta(),
                        s != null && s.getFecha() != null ? s.getFecha().toString() : null),
                new CompraDto.ProductoRefDto(compra.getProducto(),
                        p != null ? p.getDescripcionCatalogo() : "Producto " + compra.getProducto()),
                compra.getImporte(),
                compra.getComision(),
                compra.getCostoEnvio() != null ? compra.getCostoEnvio() : BigDecimal.ZERO,
                compra.getTotal(),
                Boolean.TRUE.equals(compra.getRetiroPersonal())
        );
    }
}
