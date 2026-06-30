package com.tpo.backend.catalogo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemCatalogoDetailDto {
    private Long identificador;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
    /** Estado del lote: en_puja | subastado | pendiente (regla de lote actual). */
    private String estadoLote;
    private ProductoRefDto producto;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductoRefDto {
        private Long identificador;
        private Long duenioId;
        private String descripcionCatalogo;
        private String descripcionCompleta;
        private String artista;
        private String fecha;
        private String resenia;
        private List<FotoDto> fotos;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FotoDto {
        private Long identificador;
        private String url;
    }
}
