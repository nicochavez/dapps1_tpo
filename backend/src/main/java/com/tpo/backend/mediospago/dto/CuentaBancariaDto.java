package com.tpo.backend.mediospago.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class CuentaBancariaDto extends MedioPagoDto {
    private String banco;
    private String numeroCuenta;
    private String titular;
    private BigDecimal montoReservado;
}
