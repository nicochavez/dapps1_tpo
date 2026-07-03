package com.tpo.backend.admin.controller;

import com.tpo.backend.admin.dto.MedioPagoPendienteDto;
import com.tpo.backend.admin.service.AdminMedioPagoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Backoffice de medios de pago (solo empleados; ver SecurityConfig {@code /api/v1/admin/**}).
 * - GET  /medios-pago/pendientes        : medios de pago pendientes de verificacion.
 * - POST /medios-pago/{id}/verificar    : habilita un medio de pago pendiente.
 */
@RestController
@RequestMapping("/api/v1/admin/medios-pago")
public class AdminMedioPagoController {

    private final AdminMedioPagoService adminMedioPagoService;

    public AdminMedioPagoController(AdminMedioPagoService adminMedioPagoService) {
        this.adminMedioPagoService = adminMedioPagoService;
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<MedioPagoPendienteDto>> listarPendientes() {
        return ResponseEntity.ok(adminMedioPagoService.listarPendientes());
    }

    @PostMapping("/{medioPagoId}/verificar")
    public ResponseEntity<MedioPagoPendienteDto> verificar(@PathVariable Long medioPagoId) {
        return ResponseEntity.ok(adminMedioPagoService.verificar(medioPagoId));
    }
}
