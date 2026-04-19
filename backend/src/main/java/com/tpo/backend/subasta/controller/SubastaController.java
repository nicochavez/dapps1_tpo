package com.tpo.backend.subasta.controller;

import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.subasta.dto.*;
import com.tpo.backend.subasta.service.SubastaService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/subastas")
public class SubastaController {

    private final SubastaService subastaService;

    public SubastaController(SubastaService subastaService) {
        this.subastaService = subastaService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<SubastaListItemDto>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String moneda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(subastaService.listar(estado, categoria, moneda, page, size));
    }

    @GetMapping("/{id}")
    public ResponseEntity<SubastaDetailDto> getById(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.getById(id));
    }

    @PostMapping("/{id}/conectar")
    public ResponseEntity<ConectarResponse> conectar(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.conectar(id));
    }

    @PostMapping("/{id}/desconectar")
    public ResponseEntity<Void> desconectar(@PathVariable Long id) {
        subastaService.desconectar(id);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{id}/item-actual")
    public ResponseEntity<ItemActualDto> getItemActual(@PathVariable Long id) {
        return ResponseEntity.ok(subastaService.getItemActual(id));
    }
}
