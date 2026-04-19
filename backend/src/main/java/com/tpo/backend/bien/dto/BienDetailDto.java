package com.tpo.backend.bien.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class BienDetailDto {
    private Long identificador;
    private String descripcion;
    private String estado;
    private String ubicacion;
    private SeguroDto seguro;
    private SubastaRefDto subasta;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String motivoRechazo;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SeguroDto {
        private String nroPoliza;
        private String compania;
        private BigDecimal importe;
        private String polizaCombinada;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaRefDto {
        private Long identificador;
        private String fecha;
        private String hora;
        private String ubicacion;
    }
}
