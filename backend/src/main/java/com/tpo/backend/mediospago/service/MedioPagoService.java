package com.tpo.backend.mediospago.service;

import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.mock.MockDataStore;
import com.tpo.backend.mediospago.dto.MedioPagoDto;
import com.tpo.backend.mediospago.dto.MedioPagoRequest;
import com.tpo.backend.mediospago.dto.MedioPagoUpdateRequest;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class MedioPagoService {

    private final MockDataStore store;

    public MedioPagoService(MockDataStore store) {
        this.store = store;
    }

    public List<MedioPagoDto> listar() {
        return store.mediosPago;
    }

    public MedioPagoDto create(MedioPagoRequest request) {
        String detalle = buildDetalle(request);
        MedioPagoDto mp = new MedioPagoDto(
                store.nextMedioPagoId(),
                request.getTipo(),
                detalle,
                request.getMoneda(),
                false,
                request.getMontoReservado() != null ? request.getMontoReservado() : java.math.BigDecimal.ZERO
        );
        store.mediosPago.add(mp);
        return mp;
    }

    public MedioPagoDto getById(Long id) {
        return store.mediosPago.stream()
                .filter(m -> m.getIdentificador().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado: " + id));
    }

    public MedioPagoDto update(Long id, MedioPagoUpdateRequest request) {
        MedioPagoDto mp = getById(id);
        if (request.getMontoReservado() != null) {
            mp.setMontoReservado(request.getMontoReservado());
        }
        return mp;
    }

    public void delete(Long id) {
        MedioPagoDto mp = getById(id);
        long verified = store.mediosPago.stream().filter(MedioPagoDto::isVerificado).count();
        if (mp.isVerificado() && verified <= 1) {
            throw new ConflictException("No se puede eliminar el unico medio de pago verificado.");
        }
        store.mediosPago.remove(mp);
    }

    private String buildDetalle(MedioPagoRequest req) {
        return switch (req.getTipo()) {
            case "cuenta_bancaria" -> (req.getBanco() != null ? req.getBanco() : "Banco") + " - " +
                    (req.getNumeroCuenta() != null ? "****" + req.getNumeroCuenta().substring(
                            Math.max(0, req.getNumeroCuenta().length() - 4)) : "****");
            case "tarjeta_credito" -> "Tarjeta - " +
                    (req.getNumeroTarjeta() != null ? "****" + req.getNumeroTarjeta().substring(
                            Math.max(0, req.getNumeroTarjeta().length() - 4)) : "****");
            case "cheque_certificado" -> "Cheque certificado - " + req.getMoneda();
            default -> req.getTipo();
        };
    }
}
