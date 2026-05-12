package com.tpo.backend.multa.controller;

import com.tpo.backend.multa.dto.MultaDto;
import com.tpo.backend.multa.dto.PagarMultaRequest;
import com.tpo.backend.multa.service.MultaService;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/me/multas")
public class MultaController {

    private final MultaService multaService;

    public MultaController(MultaService multaService) {
        this.multaService = multaService;
    }

    @GetMapping
    public ResponseEntity<List<MultaDto>> listar() {
        return ResponseEntity.ok(multaService.listarPendientes());
    }

    @PostMapping("/{id}/pagar")
    public ResponseEntity<Void> pagar(@PathVariable Long id,
                                       @Valid @RequestBody PagarMultaRequest request) {
        multaService.pagar(id, request);
        return ResponseEntity.ok().build();
    }
}
