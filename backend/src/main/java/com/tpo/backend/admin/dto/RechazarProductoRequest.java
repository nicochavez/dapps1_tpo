package com.tpo.backend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

/** Motivo del rechazo y cargo de devolucion a cuenta del dueno. */
@Data
public class RechazarProductoRequest {

    @NotBlank
    private String motivo;

    /** Cargo por la devolucion del bien al dueno. Si es null se aplica un cargo por defecto. */
    private BigDecimal cargoDevolucion;
}
