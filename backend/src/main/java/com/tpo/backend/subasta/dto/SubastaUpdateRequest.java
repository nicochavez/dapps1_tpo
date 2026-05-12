package com.tpo.backend.subasta.dto;

import lombok.Data;

@Data
public class SubastaUpdateRequest {
    private String fecha;
    private String hora;
    private String ubicacion;
    private String estado;
    private Integer capacidadAsistentes;
}
