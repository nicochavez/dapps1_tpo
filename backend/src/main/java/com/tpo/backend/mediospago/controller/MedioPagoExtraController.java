package com.tpo.backend.mediospago.controller;

import com.tpo.backend.mediospago.dto.MedioPagoDto;
import com.tpo.backend.mediospago.dto.MedioPagoRequest;
import com.tpo.backend.mediospago.service.MedioPagoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
public class MedioPagoExtraController {

    private final MedioPagoService medioPagoService;

    public MedioPagoExtraController(MedioPagoService medioPagoService) {
        this.medioPagoService = medioPagoService;
    }

    @GetMapping("/api/v1/usuarios/{userId}/medios-pago")
    public ResponseEntity<List<MedioPagoDto>> listarByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(medioPagoService.listarByCliente(userId));
    }

    @PostMapping("/api/v1/medios-pago/cuenta-bancaria")
    public ResponseEntity<MedioPagoDto> registrarCuentaBancaria(@Valid @RequestBody MedioPagoRequest request) {
        request.setTipo("cuenta_bancaria");
        return ResponseEntity.status(HttpStatus.CREATED).body(medioPagoService.create(request));
    }

    @PostMapping("/api/v1/medios-pago/tarjeta-credito")
    public ResponseEntity<MedioPagoDto> registrarTarjetaCredito(@Valid @RequestBody MedioPagoRequest request) {
        request.setTipo("tarjeta_credito");
        return ResponseEntity.status(HttpStatus.CREATED).body(medioPagoService.create(request));
    }

    @PostMapping("/api/v1/medios-pago/cheque")
    public ResponseEntity<MedioPagoDto> registrarCheque(@Valid @RequestBody MedioPagoRequest request) {
        request.setTipo("cheque_certificado");
        return ResponseEntity.status(HttpStatus.CREATED).body(medioPagoService.create(request));
    }
}
