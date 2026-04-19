package com.tpo.backend.mediospago.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedioPagoRequest {
    @NotBlank
    private String tipo;
    private String banco;
    private String numeroCuenta;
    private String numeroTarjeta;
    @NotBlank
    private String moneda;
    private BigDecimal montoReservado;
    private String paisBanco;
    private boolean internacional;
}
