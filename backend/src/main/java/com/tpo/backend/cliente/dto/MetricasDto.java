package com.tpo.backend.cliente.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.Map;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MetricasDto {
    private int subastasAsistidas;
    private int subastasGanadas;
    private BigDecimal totalOfertado;
    private BigDecimal totalPagado;
    private Map<String, Integer> participacionesPorCategoria;
}
