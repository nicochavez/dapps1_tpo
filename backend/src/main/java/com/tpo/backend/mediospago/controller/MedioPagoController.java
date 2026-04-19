package com.tpo.backend.mediospago.controller;

import com.tpo.backend.mediospago.dto.MedioPagoDto;
import com.tpo.backend.mediospago.dto.MedioPagoRequest;
import com.tpo.backend.mediospago.dto.MedioPagoUpdateRequest;
import com.tpo.backend.mediospago.service.MedioPagoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/me/medios-pago")
public class MedioPagoController {

    private final MedioPagoService medioPagoService;

    public MedioPagoController(MedioPagoService medioPagoService) {
        this.medioPagoService = medioPagoService;
    }

    @GetMapping
    public ResponseEntity<List<MedioPagoDto>> listar() {
        return ResponseEntity.ok(medioPagoService.listar());
    }

    @PostMapping
    public ResponseEntity<MedioPagoDto> create(@Valid @RequestBody MedioPagoRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(medioPagoService.create(request));
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedioPagoDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(medioPagoService.getById(id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedioPagoDto> update(@PathVariable Long id, @RequestBody MedioPagoUpdateRequest request) {
        return ResponseEntity.ok(medioPagoService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        medioPagoService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
