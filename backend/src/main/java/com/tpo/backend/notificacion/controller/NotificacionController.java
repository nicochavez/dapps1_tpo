package com.tpo.backend.notificacion.controller;

import com.tpo.backend.notificacion.dto.NotificacionDto;
import com.tpo.backend.notificacion.entity.NotificacionEntity;
import com.tpo.backend.notificacion.repository.NotificacionRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/usuarios/{userId}/notificaciones")
public class NotificacionController {

    private final NotificacionRepository notificacionRepository;

    public NotificacionController(NotificacionRepository notificacionRepository) {
        this.notificacionRepository = notificacionRepository;
    }

    @GetMapping
    public ResponseEntity<List<NotificacionDto>> listar(@PathVariable Long userId) {
        List<NotificacionDto> notificaciones = notificacionRepository
                .findByClienteOrderByFechaCreacionDesc(userId).stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(notificaciones);
    }

    private NotificacionDto toDto(NotificacionEntity n) {
        return new NotificacionDto(
                n.getId(),
                n.getTitulo(),
                n.getMensaje(),
                Boolean.TRUE.equals(n.getLeida()),
                n.getFechaCreacion() != null ? n.getFechaCreacion().toString() : null
        );
    }
}
