package com.tpo.backend.subasta.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SubastaNewRequest {
    @NotBlank
    private String fecha;
    @NotBlank
    private String hora;
    @NotBlank
    private String ubicacion;
    private Integer capacidadAsistentes;
    private Boolean tieneDeposito;
    private Boolean seguridadPropia;
    @NotBlank
    private String categoria;
    private String moneda;
    @NotNull
    private Long subastador;
}
