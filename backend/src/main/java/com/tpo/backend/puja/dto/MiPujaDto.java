package com.tpo.backend.puja.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiPujaDto {
    private ItemRefDto item;
    private BigDecimal importe;
    private String ganador;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemRefDto {
        private Long identificador;
        private String descripcion;
    }
}
