package com.tpo.backend.catalogo.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class CatalogoNewRequest {
    @NotBlank
    private String descripcion;
    @NotNull
    private Long responsable;
}
