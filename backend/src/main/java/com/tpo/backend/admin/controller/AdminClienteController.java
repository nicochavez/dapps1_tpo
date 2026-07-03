package com.tpo.backend.admin.controller;

import com.tpo.backend.admin.dto.AprobarClienteRequest;
import com.tpo.backend.admin.dto.CambiarCategoriaRequest;
import com.tpo.backend.admin.service.AdminClienteService;
import com.tpo.backend.cliente.dto.ClienteDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/admin/clientes")
public class AdminClienteController {

    private final AdminClienteService adminClienteService;

    public AdminClienteController(AdminClienteService adminClienteService) {
        this.adminClienteService = adminClienteService;
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<ClienteDto>> listarPendientes() {
        return ResponseEntity.ok(adminClienteService.listarPendientes());
    }

    @PostMapping("/{clienteId}/aprobar")
    public ResponseEntity<ClienteDto> aprobar(@PathVariable Long clienteId,
                                              @RequestBody AprobarClienteRequest request) {
        return ResponseEntity.ok(adminClienteService.aprobar(clienteId, request));
    }

    @PostMapping("/{clienteId}/rechazar")
    public ResponseEntity<ClienteDto> rechazar(@PathVariable Long clienteId) {
        return ResponseEntity.ok(adminClienteService.rechazar(clienteId));
    }

    @PutMapping("/{clienteId}/categoria")
    public ResponseEntity<ClienteDto> cambiarCategoria(@PathVariable Long clienteId,
                                                       @Valid @RequestBody CambiarCategoriaRequest request) {
        return ResponseEntity.ok(adminClienteService.cambiarCategoria(clienteId, request));
    }
}