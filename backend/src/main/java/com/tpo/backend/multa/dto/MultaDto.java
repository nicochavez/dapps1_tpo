package com.tpo.backend.multa.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MultaDto {
    private Long identificador;
    private BigDecimal importeOriginal;
    private BigDecimal multa;
    private String estado;
    private String fechaLimite;
    private CompraRefDto compra;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class CompraRefDto {
        private Long identificador;
        private String producto;
    }
}
