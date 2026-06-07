package com.tpo.backend.mediospago.service;

import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.mediospago.dto.*;
import com.tpo.backend.mediospago.entity.*;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class MedioPagoService {

    private final MedioPagoRepository medioPagoRepository;

    public MedioPagoService(MedioPagoRepository medioPagoRepository) {
        this.medioPagoRepository = medioPagoRepository;
    }

    @Transactional(readOnly = true)
    public List<MedioPagoDto> listar(Long clienteId) {
        return medioPagoRepository.findByCliente(clienteId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional(readOnly = true)
    public MedioPagoDto getById(Long clienteId, Long id) {
        MedioPagoEntity mp = findOrThrow(id);
        if (!mp.getCliente().equals(clienteId)) {
            throw new ResourceNotFoundException("Medio de pago no encontrado: " + id);
        }
        return toDto(mp);
    }

    @Transactional
    public CuentaBancariaDto crearCuentaBancaria(Long clienteId, CuentaBancariaRequest req) {
        CuentaBancariaEntity e = new CuentaBancariaEntity();
        e.setCliente(clienteId);
        e.setMoneda(req.getMoneda());
        e.setInternacional(req.isInternacional());
        e.setBanco(req.getBanco());
        e.setNumeroCuenta(req.getNumeroCuenta());
        e.setTitular(req.getTitular());
        e.setMontoReservado(req.getMontoReservado());
        e.setDetalle(req.getBanco() + " - ****" + last4(req.getNumeroCuenta()));
        return (CuentaBancariaDto) toDto(medioPagoRepository.save(e));
    }

    @Transactional
    public TarjetaCreditoDto crearTarjetaCredito(Long clienteId, TarjetaCreditoRequest req) {
        TarjetaCreditoEntity e = new TarjetaCreditoEntity();
        e.setCliente(clienteId);
        e.setMoneda(req.getMoneda());
        e.setInternacional(req.isInternacional());
        e.setBancoEmisor(req.getBancoEmisor());
        e.setUltimosCuatro(req.getUltimosCuatro());
        e.setTitular(req.getTitular());
        e.setFechaVencimiento(req.getFechaVencimiento());
        e.setDetalle("Tarjeta ****" + req.getUltimosCuatro());
        return (TarjetaCreditoDto) toDto(medioPagoRepository.save(e));
    }

    @Transactional
    public ChequeCertificadoDto crearChequeCertificado(Long clienteId, ChequeCertificadoRequest req) {
        ChequeCertificadoEntity e = new ChequeCertificadoEntity();
        e.setCliente(clienteId);
        e.setMoneda(req.getMoneda());
        e.setInternacional(req.isInternacional());
        e.setBanco(req.getBanco());
        e.setNumeroCheque(req.getNumeroCheque());
        e.setMontoCertificado(req.getMontoCertificado());
        e.setFechaVencimiento(req.getFechaVencimiento());
        e.setDetalle("Cheque certificado " + req.getBanco() + " - " + req.getMoneda());
        return (ChequeCertificadoDto) toDto(medioPagoRepository.save(e));
    }

    @Transactional
    public void delete(Long clienteId, Long id) {
        MedioPagoEntity mp = findOrThrow(id);
        if (!mp.getCliente().equals(clienteId)) {
            throw new ResourceNotFoundException("Medio de pago no encontrado: " + id);
        }
        long verified = medioPagoRepository.findByCliente(clienteId).stream()
                .filter(m -> Boolean.TRUE.equals(m.getVerificado()))
                .count();
        if (Boolean.TRUE.equals(mp.getVerificado()) && verified <= 1) {
            throw new ConflictException("No se puede eliminar el único medio de pago verificado.");
        }
        medioPagoRepository.delete(mp);
    }

    private MedioPagoEntity findOrThrow(Long id) {
        return medioPagoRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado: " + id));
    }

    private MedioPagoDto toDto(MedioPagoEntity mp) {
        if (mp instanceof CuentaBancariaEntity c) {
            return CuentaBancariaDto.builder()
                    .identificador(c.getId())
                    .tipo("cuenta_bancaria")
                    .moneda(c.getMoneda())
                    .internacional(Boolean.TRUE.equals(c.getInternacional()))
                    .verificado(Boolean.TRUE.equals(c.getVerificado()))
                    .vigente(Boolean.TRUE.equals(c.getVigente()))
                    .detalle(c.getDetalle())
                    .banco(c.getBanco())
                    .numeroCuenta(c.getNumeroCuenta())
                    .titular(c.getTitular())
                    .montoReservado(c.getMontoReservado())
                    .build();
        } else if (mp instanceof TarjetaCreditoEntity t) {
            return TarjetaCreditoDto.builder()
                    .identificador(t.getId())
                    .tipo("tarjeta_credito")
                    .moneda(t.getMoneda())
                    .internacional(Boolean.TRUE.equals(t.getInternacional()))
                    .verificado(Boolean.TRUE.equals(t.getVerificado()))
                    .vigente(Boolean.TRUE.equals(t.getVigente()))
                    .detalle(t.getDetalle())
                    .bancoEmisor(t.getBancoEmisor())
                    .ultimosCuatro(t.getUltimosCuatro())
                    .titular(t.getTitular())
                    .fechaVencimiento(t.getFechaVencimiento())
                    .build();
        } else if (mp instanceof ChequeCertificadoEntity ch) {
            return ChequeCertificadoDto.builder()
                    .identificador(ch.getId())
                    .tipo("cheque_certificado")
                    .moneda(ch.getMoneda())
                    .internacional(Boolean.TRUE.equals(ch.getInternacional()))
                    .verificado(Boolean.TRUE.equals(ch.getVerificado()))
                    .vigente(Boolean.TRUE.equals(ch.getVigente()))
                    .detalle(ch.getDetalle())
                    .banco(ch.getBanco())
                    .numeroCheque(ch.getNumeroCheque())
                    .montoCertificado(ch.getMontoCertificado())
                    .fechaVencimiento(ch.getFechaVencimiento())
                    .build();
        }
        throw new IllegalStateException("Tipo de medio de pago desconocido: " + mp.getClass());
    }

    private String last4(String s) {
        if (s == null || s.length() < 4) return s != null ? s : "";
        return s.substring(s.length() - 4);
    }
}
