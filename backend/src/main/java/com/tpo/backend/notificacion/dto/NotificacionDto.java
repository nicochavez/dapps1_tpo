package com.tpo.backend.notificacion.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class NotificacionDto {
    private Long identificador;
    private String titulo;
    private String mensaje;
    private boolean leida;
    private String fechaCreacion;
}
