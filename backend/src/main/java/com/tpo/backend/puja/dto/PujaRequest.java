package com.tpo.backend.puja.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PujaRequest {
    @NotNull
    private BigDecimal importe;
    private Long medioPagoId;
    /** Clave de idempotencia (UUID) para reintentar sin duplicar la puja ante cortes de red. */
    private String idempotencyKey;
}
