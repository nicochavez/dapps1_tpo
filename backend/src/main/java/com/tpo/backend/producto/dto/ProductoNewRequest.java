package com.tpo.backend.producto.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ProductoNewRequest {
    @NotBlank
    private String fecha;
    @NotNull
    private Boolean disponible;
    private String descripcionCatalogo;
    @NotBlank
    private String descripcionCompleta;
    @NotNull
    private Long revisor;
    private String seguro;
    private String categoria;
    private String subcategoria;
}
