package com.tpo.backend.mediospago.service;

import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.mediospago.dto.MedioPagoDto;
import com.tpo.backend.mediospago.dto.MedioPagoRequest;
import com.tpo.backend.mediospago.dto.MedioPagoUpdateRequest;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.List;

@Service
public class MedioPagoService {

    private final MedioPagoRepository medioPagoRepository;
    private final ClienteService clienteService;

    public MedioPagoService(MedioPagoRepository medioPagoRepository,
                            ClienteService clienteService) {
        this.medioPagoRepository = medioPagoRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public List<MedioPagoDto> listar() {
        Long clienteId = clienteService.currentClienteEntity().getId();
        return medioPagoRepository.findByCliente(clienteId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public List<MedioPagoDto> listarByCliente(Long clienteId) {
        return medioPagoRepository.findByCliente(clienteId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public MedioPagoDto create(MedioPagoRequest request) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        MedioPagoEntity mp = new MedioPagoEntity();
        mp.setCliente(clienteId);
        mp.setTipo(request.getTipo());
        mp.setBanco(request.getBanco());
        mp.setNumeroCuenta(request.getNumeroCuenta());
        mp.setNumeroTarjeta(request.getNumeroTarjeta());
        mp.setPaisBanco(request.getPaisBanco());
        mp.setMoneda(request.getMoneda());
        mp.setMontoReservado(request.getMontoReservado() != null ? request.getMontoReservado() : BigDecimal.ZERO);
        mp.setInternacional(request.isInternacional());
        mp.setVerificado(false);
        mp.setDetalle(buildDetalle(request));
        mp = medioPagoRepository.save(mp);
        return toDto(mp);
    }

    @Transactional
    public MedioPagoDto getById(Long id) {
        return toDto(findOrThrow(id));
    }

    @Transactional
    public MedioPagoDto update(Long id, MedioPagoUpdateRequest request) {
        MedioPagoEntity mp = findOrThrow(id);
        if (request.getMontoReservado() != null) {
            mp.setMontoReservado(request.getMontoReservado());
        }
        medioPagoRepository.save(mp);
        return toDto(mp);
    }

    @Transactional
    public void delete(Long id) {
        MedioPagoEntity mp = findOrThrow(id);
        long verified = medioPagoRepository.findByCliente(mp.getCliente()).stream()
                .filter(m -> Boolean.TRUE.equals(m.getVerificado()))
                .count();
        if (Boolean.TRUE.equals(mp.getVerificado()) && verified <= 1) {
            throw new ConflictException("No se puede eliminar el unico medio de pago verificado.");
        }
        medioPagoRepository.delete(mp);
    }

    private MedioPagoEntity findOrThrow(Long id) {
        return medioPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado: " + id));
    }

    private MedioPagoDto toDto(MedioPagoEntity mp) {
        return new MedioPagoDto(
                mp.getId(),
                mp.getTipo(),
                mp.getDetalle(),
                mp.getMoneda(),
                Boolean.TRUE.equals(mp.getVerificado()),
                mp.getMontoReservado() != null ? mp.getMontoReservado() : BigDecimal.ZERO
        );
    }

    private String buildDetalle(MedioPagoRequest req) {
        return switch (req.getTipo()) {
            case "cuenta_bancaria" -> (req.getBanco() != null ? req.getBanco() : "Banco") + " - " +
                    (req.getNumeroCuenta() != null ? "****" + req.getNumeroCuenta().substring(
                            Math.max(0, req.getNumeroCuenta().length() - 4)) : "****");
            case "tarjeta_credito" -> "Tarjeta - " +
                    (req.getNumeroTarjeta() != null ? "****" + req.getNumeroTarjeta().substring(
                            Math.max(0, req.getNumeroTarjeta().length() - 4)) : "****");
            case "cheque", "cheque_certificado" -> "Cheque certificado - " + req.getMoneda();
            default -> req.getTipo();
        };
    }
}
