package com.tpo.backend.puja.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class PujaRequest {
    @NotNull
    private BigDecimal importe;
    @NotNull
    private Long medioPagoId;
}
