package com.tpo.backend.bien.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BienListDto {
    private Long identificador;
    private String descripcion;
    private String estado;
    private SubastaRefDto subasta;
    private BigDecimal precioBase;
    private BigDecimal comision;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaRefDto {
        private Long identificador;
        private String fecha;
    }
}
