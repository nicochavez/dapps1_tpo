package com.tpo.backend.compra.service;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.compra.dto.CompraDto;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.historial.dto.HistorialSubastaDto;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
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
    private final MedioPagoRepository medioPagoRepository;

    public CompraService(CompraRepository compraRepository,
                         RegistroDeSubastaRepository registroRepository,
                         ItemCatalogoRepository itemRepository,
                         ClienteService clienteService,
                         MedioPagoRepository medioPagoRepository) {
        this.compraRepository = compraRepository;
        this.registroRepository = registroRepository;
        this.itemRepository = itemRepository;
        this.clienteService = clienteService;
        this.medioPagoRepository = medioPagoRepository;
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

    /** Marca la compra como pagada (RF pago del ganador). Exige un medio de pago verificado del cliente. */
    @Transactional
    public void pagar(Long id, Long medioPagoId) {
        CompraEntity compra = findOrThrow(id);
        Long clienteId = clienteService.currentClienteEntity().getId();

        MedioPagoEntity medio = medioPagoRepository.findById(medioPagoId)
                .orElseThrow(() -> new UnprocessableEntityException("Medio de pago invalido."));
        boolean esDelCliente = medio.getCliente() != null && clienteId.equals(medio.getCliente().getId());
        if (!esDelCliente
                || !Boolean.TRUE.equals(medio.getVerificado())
                || !Boolean.TRUE.equals(medio.getVigente())) {
            throw new UnprocessableEntityException(
                    "El medio de pago no esta verificado o no es valido para pagar.");
        }

        // La compra se paga en la moneda de la subasta: el medio debe coincidir.
        String monedaSubasta = compra.getSubasta() != null ? compra.getSubasta().getMoneda() : null;
        if (monedaSubasta != null && !monedaSubasta.equalsIgnoreCase(medio.getMoneda())) {
            throw new UnprocessableEntityException(
                    "El medio de pago debe estar en " + monedaSubasta + " para pagar esta compra.");
        }

        compra.setMedioPago(medio);
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
                itemId,
                s.getMoneda()
        );
    }
}
