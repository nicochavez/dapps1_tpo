package com.tpo.backend.producto.dto;

import lombok.Data;

@Data
public class ProductoUpdateRequest {
    private String fecha;
    private Boolean disponible;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private Long revisor;
    private String seguro;
    private String categoria;
    private String subcategoria;
}
