package com.tpo.backend.multa.service;

import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import com.tpo.backend.multa.dto.MultaDto;
import com.tpo.backend.multa.dto.PagarMultaRequest;
import com.tpo.backend.multa.entity.MultaEntity;
import com.tpo.backend.multa.repository.MultaRepository;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MultaService {

    private final MultaRepository multaRepository;
    private final MedioPagoRepository medioPagoRepository;
    private final CompraRepository compraRepository;
    private final ProductoRepository productoRepository;
    private final ClienteService clienteService;

    public MultaService(MultaRepository multaRepository,
                        MedioPagoRepository medioPagoRepository,
                        CompraRepository compraRepository,
                        ProductoRepository productoRepository,
                        ClienteService clienteService) {
        this.multaRepository = multaRepository;
        this.medioPagoRepository = medioPagoRepository;
        this.compraRepository = compraRepository;
        this.productoRepository = productoRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public List<MultaDto> listarPendientes() {
        Long clienteId = clienteService.currentClienteEntity().getId();
        return multaRepository.findByClienteAndEstado(clienteId, "pendiente").stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public void pagar(Long id, PagarMultaRequest request) {
        MultaEntity multa = multaRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Multa no encontrada: " + id));

        MedioPagoEntity medioPago = medioPagoRepository.findById(request.getMedioPagoId())
                .filter(m -> Boolean.TRUE.equals(m.getVerificado()))
                .orElseThrow(() -> new UnprocessableEntityException("Fondos insuficientes o medio de pago invalido."));

        multa.setEstado("pagada");
        multaRepository.save(multa);
    }

    private MultaDto toDto(MultaEntity m) {
        MultaDto.CompraRefDto compraRef = null;
        if (m.getCompra() != null) {
            CompraEntity compra = compraRepository.findById(m.getCompra()).orElse(null);
            if (compra != null) {
                ProductoEntity prod = productoRepository.findById(compra.getProducto()).orElse(null);
                compraRef = new MultaDto.CompraRefDto(
                        compra.getId(),
                        prod != null ? prod.getDescripcionCatalogo() : "Producto " + compra.getProducto()
                );
            }
        }
        return new MultaDto(
                m.getId(),
                m.getImporteOriginal(),
                m.getMulta(),
                m.getEstado(),
                m.getFechaLimite() != null ? m.getFechaLimite().toString() : null,
                compraRef
        );
    }
}
