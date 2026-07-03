package com.tpo.backend.admin.controller;

import com.tpo.backend.admin.dto.PagoPendienteDto;
import com.tpo.backend.admin.service.AdminPagoService;
import com.tpo.backend.multa.dto.MultaDto;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Backoffice de pagos y multas (solo empleados; ver SecurityConfig {@code /api/v1/admin/**}).
 * - GET  /pagos-pendientes            : usuarios con compras impagas.
 * - POST /compras/{compraId}/multa    : aplica una multa del 10% al deudor y lo notifica.
 * - POST /usuarios/{clienteId}/bloquear : deshabilita el acceso de un usuario a la app.
 */
@RestController
@RequestMapping("/api/v1/admin")
public class AdminPagoController {

    private final AdminPagoService adminPagoService;

    public AdminPagoController(AdminPagoService adminPagoService) {
        this.adminPagoService = adminPagoService;
    }

    @GetMapping("/pagos-pendientes")
    public ResponseEntity<List<PagoPendienteDto>> listarPagosPendientes() {
        return ResponseEntity.ok(adminPagoService.listarPagosPendientes());
    }

    @PostMapping("/compras/{compraId}/multa")
    public ResponseEntity<MultaDto> asignarMulta(@PathVariable Long compraId) {
        return ResponseEntity.ok(adminPagoService.asignarMulta(compraId));
    }

    @PostMapping("/usuarios/{clienteId}/bloquear")
    public ResponseEntity<Void> bloquearUsuario(@PathVariable Long clienteId) {
        adminPagoService.bloquearUsuario(clienteId);
        return ResponseEntity.ok().build();
    }
}
