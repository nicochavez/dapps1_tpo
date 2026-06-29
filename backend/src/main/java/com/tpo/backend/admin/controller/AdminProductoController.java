package com.tpo.backend.admin.controller;

import com.tpo.backend.admin.dto.AprobarProductoRequest;
import com.tpo.backend.admin.dto.RechazarProductoRequest;
import com.tpo.backend.admin.service.AdminProductoService;
import com.tpo.backend.producto.dto.ProductoDto;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/**
 * Backoffice de bienes (solo empleados; ver SecurityConfig {@code /api/v1/admin/**}).
 * Simula desde Swagger la inspeccion: aprobar con condiciones o rechazar con motivo.
 */
@RestController
@RequestMapping("/api/v1/admin/productos")
public class AdminProductoController {

    private final AdminProductoService adminProductoService;

    public AdminProductoController(AdminProductoService adminProductoService) {
        this.adminProductoService = adminProductoService;
    }

    @GetMapping("/pendientes")
    public ResponseEntity<List<ProductoDto>> listarPendientes() {
        return ResponseEntity.ok(adminProductoService.listarPendientes());
    }

    @PostMapping("/{productoId}/aprobar")
    public ResponseEntity<ProductoDto> aprobar(@PathVariable Long productoId,
                                               @Valid @RequestBody AprobarProductoRequest request) {
        return ResponseEntity.ok(adminProductoService.aprobar(productoId, request));
    }

    @PostMapping("/{productoId}/rechazar")
    public ResponseEntity<ProductoDto> rechazar(@PathVariable Long productoId,
                                                @Valid @RequestBody RechazarProductoRequest request) {
        return ResponseEntity.ok(adminProductoService.rechazar(productoId, request));
    }
}
