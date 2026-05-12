package com.tpo.backend.catalogo.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class ItemCatalogoNewRequest {
    @NotNull
    private Long catalogo;
    @NotNull
    private Long producto;
    @NotNull
    private BigDecimal precioBase;
    @NotNull
    private BigDecimal comision;
}
