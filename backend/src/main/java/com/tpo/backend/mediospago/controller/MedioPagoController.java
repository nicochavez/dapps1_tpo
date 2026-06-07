package com.tpo.backend.mediospago.controller;

import com.tpo.backend.mediospago.dto.*;
import com.tpo.backend.mediospago.service.MedioPagoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/{clienteId}/medios-pago")
public class MedioPagoController {

    private final MedioPagoService medioPagoService;

    public MedioPagoController(MedioPagoService medioPagoService) {
        this.medioPagoService = medioPagoService;
    }

    @GetMapping
    public ResponseEntity<List<MedioPagoDto>> listar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(medioPagoService.listar(clienteId));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedioPagoDto> getById(@PathVariable Long clienteId, @PathVariable Long id) {
        return ResponseEntity.ok(medioPagoService.getById(clienteId, id));
    }

    @PostMapping("/cuenta-bancaria")
    public ResponseEntity<CuentaBancariaDto> crearCuentaBancaria(
            @PathVariable Long clienteId,
            @Valid @RequestBody CuentaBancariaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearCuentaBancaria(clienteId, request));
    }

    @PostMapping("/tarjeta-credito")
    public ResponseEntity<TarjetaCreditoDto> crearTarjetaCredito(
            @PathVariable Long clienteId,
            @Valid @RequestBody TarjetaCreditoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearTarjetaCredito(clienteId, request));
    }

    @PostMapping("/cheque-certificado")
    public ResponseEntity<ChequeCertificadoDto> crearChequeCertificado(
            @PathVariable Long clienteId,
            @Valid @RequestBody ChequeCertificadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearChequeCertificado(clienteId, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long clienteId, @PathVariable Long id) {
        medioPagoService.delete(clienteId, id);
        return ResponseEntity.noContent().build();
    }
}
