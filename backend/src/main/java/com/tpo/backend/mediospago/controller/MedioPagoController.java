package com.tpo.backend.mediospago.controller;

import com.tpo.backend.auth.security.AuthenticatedUser;
import com.tpo.backend.mediospago.dto.*;
import com.tpo.backend.mediospago.service.MedioPagoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Los medios de pago del cliente autenticado. La identidad se toma del JWT
 * ({@code clienteId = persona del token}), nunca de la URL, para evitar IDOR.
 */
@RestController
@RequestMapping("/api/v1/clientes/me/medios-pago")
public class MedioPagoController {

    private final MedioPagoService medioPagoService;

    public MedioPagoController(MedioPagoService medioPagoService) {
        this.medioPagoService = medioPagoService;
    }

    @GetMapping
    public ResponseEntity<List<MedioPagoDto>> listar(@AuthenticationPrincipal AuthenticatedUser me) {
        return ResponseEntity.ok(medioPagoService.listar(me.personaId()));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedioPagoDto> getById(@AuthenticationPrincipal AuthenticatedUser me,
                                                @PathVariable Long id) {
        return ResponseEntity.ok(medioPagoService.getById(me.personaId(), id));
    }

    @PostMapping("/cuenta-bancaria")
    public ResponseEntity<CuentaBancariaDto> crearCuentaBancaria(
            @AuthenticationPrincipal AuthenticatedUser me,
            @Valid @RequestBody CuentaBancariaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearCuentaBancaria(me.personaId(), request));
    }

    @PostMapping("/tarjeta-credito")
    public ResponseEntity<TarjetaCreditoDto> crearTarjetaCredito(
            @AuthenticationPrincipal AuthenticatedUser me,
            @Valid @RequestBody TarjetaCreditoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearTarjetaCredito(me.personaId(), request));
    }

    @PostMapping("/cheque-certificado")
    public ResponseEntity<ChequeCertificadoDto> crearChequeCertificado(
            @AuthenticationPrincipal AuthenticatedUser me,
            @Valid @RequestBody ChequeCertificadoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medioPagoService.crearChequeCertificado(me.personaId(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long id) {
        medioPagoService.delete(me.personaId(), id);
        return ResponseEntity.noContent().build();
    }
}
