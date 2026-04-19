package com.tpo.backend.puja.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PujaResponse {
    private Long identificador;
    private BigDecimal importe;
    private String ganador;
    private boolean confirmada;
}
