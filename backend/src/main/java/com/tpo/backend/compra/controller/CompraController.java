package com.tpo.backend.compra.controller;

import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.compra.dto.CompraDto;
import com.tpo.backend.compra.service.CompraService;
import com.tpo.backend.historial.dto.HistorialSubastaDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clientes/me")
public class CompraController {

    private final CompraService compraService;

    public CompraController(CompraService compraService) {
        this.compraService = compraService;
    }

    @PostMapping("/newCompra")
    public ResponseEntity<PagedResponse<CompraDto>> newCompra(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.status(HttpStatus.CREATED).body(compraService.listar(page, size));
    }

    @GetMapping("/compras")
    public ResponseEntity<PagedResponse<CompraDto>> listar(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(compraService.listar(page, size));
    }

    @GetMapping("/compras/{id}")
    public ResponseEntity<CompraDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(compraService.getById(id));
    }

    @PutMapping("/compras/{id}/retiro-personal")
    public ResponseEntity<Void> setRetiroPersonal(@PathVariable Long id) {
        compraService.setRetiroPersonal(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/subastas")
    public ResponseEntity<PagedResponse<HistorialSubastaDto>> getHistorial(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(compraService.getHistorial(page, size));
    }
}
