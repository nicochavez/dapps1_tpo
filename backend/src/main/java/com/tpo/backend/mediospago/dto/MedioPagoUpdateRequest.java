package com.tpo.backend.mediospago.dto;

import lombok.Data;

import java.math.BigDecimal;

@Data
public class MedioPagoUpdateRequest {
    private BigDecimal montoReservado;
}
