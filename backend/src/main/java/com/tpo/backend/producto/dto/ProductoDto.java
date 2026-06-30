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
    private String estado;
    private DuenioDto duenio;
    private List<FotoDto> fotos;
    private SeguroDto seguro;
    /** Datos de la subasta a la que quedo asignado el item (null si aun no esta en catalogo). */
    private SubastaResumenDto subasta;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class DuenioDto {
        private Long identificador;
        private String nombre;
    }

    /** Resumen de la subasta del item para que el front muestre estado (upcoming/live/ended) y categoria. */
    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaResumenDto {
        private Long identificador;
        private String estado;
        private String fecha;
        private String hora;
        private String categoria;
        /** Catalogo e item (itemcatalogo) del producto, para abrir el detalle unificado. */
        private Long catalogoId;
        private Long itemId;
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
