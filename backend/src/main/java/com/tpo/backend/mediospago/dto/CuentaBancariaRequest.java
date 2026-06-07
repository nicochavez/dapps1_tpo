package com.tpo.backend.mediospago.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class CuentaBancariaRequest {
    @NotBlank
    private String banco;
    @NotBlank
    private String numeroCuenta;
    private String titular;
    private BigDecimal montoReservado;
    @NotBlank
    @Pattern(regexp = "ARS|USD")
    private String moneda;
    private boolean internacional;
}
