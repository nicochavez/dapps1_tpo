package com.tpo.backend.historial.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class HistorialSubastaDto {
    private Long identificador;
    private String fecha;
    private String categoria;
    private String estado;
    private int ganadas;
    private BigDecimal totalOfertado;
}
