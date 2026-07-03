package com.tpo.backend.producto.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/**
 * Condiciones propuestas por la empresa para un bien aceptado, que el dueno
 * debe aceptar o rechazar desde la app (pantalla AuctionUnderReview).
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PropuestaDto {
    private Long productoId;
    private String estado;
    private String titulo;
    private BigDecimal precioBase;
    private BigDecimal comision;
    /** Motivo del rechazo (solo cuando el producto fue rechazado por la empresa). */
    private String motivo;
    private SubastaInfo subasta;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaInfo {
        private String fecha;
        private String hora;
        private String lugar;
        /** Moneda de la subasta (ARS | USD): aclara en qué moneda está el precio base. */
        private String moneda;
    }
}
