package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemActualDto {
    private ItemInfoDto item;
    private MejorOfertaDto mejorOferta;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemInfoDto {
        private Long identificador;
        private String descripcion;
        private BigDecimal precioBase;
        private List<FotoRefDto> imagenes;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MejorOfertaDto {
        private BigDecimal importe;
        private Integer numeroPostor;
    }
}
