package com.tpo.backend.bien.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BienSolicitudResponse {
    private Long identificador;
    private String estado;
    private String mensaje;
}
