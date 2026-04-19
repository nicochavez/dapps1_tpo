package com.tpo.backend.cliente.controller;

import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.dto.ClienteUpdateRequest;
import com.tpo.backend.cliente.dto.MetricasDto;
import com.tpo.backend.cliente.service.ClienteService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/clientes/me")
public class ClienteController {

    private final ClienteService clienteService;

    public ClienteController(ClienteService clienteService) {
        this.clienteService = clienteService;
    }

    @GetMapping
    public ResponseEntity<ClienteDto> getPerfil() {
        return ResponseEntity.ok(clienteService.getAuthenticatedCliente());
    }

    @PutMapping
    public ResponseEntity<ClienteDto> updatePerfil(@RequestBody ClienteUpdateRequest request) {
        return ResponseEntity.ok(clienteService.updateCliente(request));
    }

    @GetMapping("/metricas")
    public ResponseEntity<MetricasDto> getMetricas() {
        return ResponseEntity.ok(clienteService.getMetricas());
    }
}
