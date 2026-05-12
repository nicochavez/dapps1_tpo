package com.tpo.backend.direccion.controller;

import com.tpo.backend.direccion.dto.DireccionDto;
import com.tpo.backend.direccion.dto.DireccionRequest;
import com.tpo.backend.direccion.service.DireccionService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios/{userId}/direcciones")
public class DireccionController {

    private final DireccionService direccionService;

    public DireccionController(DireccionService direccionService) {
        this.direccionService = direccionService;
    }

    @GetMapping
    public ResponseEntity<List<DireccionDto>> listar(@PathVariable Long userId) {
        return ResponseEntity.ok(direccionService.listar(userId));
    }

    @PostMapping
    public ResponseEntity<DireccionDto> crear(@PathVariable Long userId,
                                               @Valid @RequestBody DireccionRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(direccionService.crear(userId, request));
    }

    @GetMapping("/favorita")
    public ResponseEntity<DireccionDto> getFavorita(@PathVariable Long userId) {
        return ResponseEntity.ok(direccionService.getFavorita(userId));
    }

    @PutMapping("/{direccionId}")
    public ResponseEntity<DireccionDto> actualizar(@PathVariable Long userId,
                                                    @PathVariable Long direccionId,
                                                    @Valid @RequestBody DireccionRequest request) {
        return ResponseEntity.ok(direccionService.actualizar(userId, direccionId, request));
    }

    @DeleteMapping("/{direccionId}")
    public ResponseEntity<Void> eliminar(@PathVariable Long userId, @PathVariable Long direccionId) {
        direccionService.eliminar(userId, direccionId);
        return ResponseEntity.noContent().build();
    }
}
