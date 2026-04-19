package com.tpo.backend.puja.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PujaHistorialDto {
    private Long identificador;
    private Integer numeroPostor;
    private BigDecimal importe;
    private String ganador;
    private String timestamp;
}
