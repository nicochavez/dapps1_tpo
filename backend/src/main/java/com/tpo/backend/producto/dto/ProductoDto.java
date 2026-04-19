package com.tpo.backend.producto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ProductoDto {
    private Long identificador;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private String fecha;
    private String disponible;
    private DuenioDto duenio;
    private List<FotoDto> fotos;
    private SeguroDto seguro;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DuenioDto {
        private Long identificador;
        private String nombre;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class FotoDto {
        private Long identificador;
        private String url;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeguroDto {
        private String nroPoliza;
        private String compania;
        private BigDecimal importe;
    }
}
