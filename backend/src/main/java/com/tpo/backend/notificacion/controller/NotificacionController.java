package com.tpo.backend.notificacion.controller;

import com.tpo.backend.auth.security.SecurityUtils;
import com.tpo.backend.notificacion.dto.NotificacionDto;
import com.tpo.backend.notificacion.service.NotificacionService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/me/notificaciones")
public class NotificacionController {

    private final NotificacionService notificacionService;

    public NotificacionController(NotificacionService notificacionService) {
        this.notificacionService = notificacionService;
    }

    /** Lista historica de notificaciones del cliente autenticado. */
    @GetMapping
    public ResponseEntity<List<NotificacionDto>> listar() {
        Long clienteId = SecurityUtils.currentPersonaId();
        return ResponseEntity.ok(notificacionService.listar(clienteId));
    }

    /** Stream SSE: el cliente abre esta conexion para recibir notificaciones en tiempo real. */
    @GetMapping(value = "/stream", produces = MediaType.TEXT_EVENT_STREAM_VALUE)
    public SseEmitter stream() {
        Long clienteId = SecurityUtils.currentPersonaId();
        return notificacionService.subscribe(clienteId);
    }

    /** Marca una notificacion como leida. */
    @PatchMapping("/{id}/leida")
    public ResponseEntity<NotificacionDto> marcarLeida(@PathVariable Long id) {
        Long clienteId = SecurityUtils.currentPersonaId();
        return ResponseEntity.ok(notificacionService.marcarLeida(clienteId, id));
    }
}
