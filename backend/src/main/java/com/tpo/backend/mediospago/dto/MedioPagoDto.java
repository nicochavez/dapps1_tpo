package com.tpo.backend.mediospago.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedioPagoDto {
    private Long identificador;
    private String tipo;
    private String detalle;
    private String moneda;
    private boolean verificado;
    private BigDecimal montoReservado;
}
