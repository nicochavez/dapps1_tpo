package com.tpo.backend.compra.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CompraDto {
    private Long identificador;
    private SubastaRefDto subasta;
    private ProductoRefDto producto;
    private BigDecimal importe;
    private BigDecimal comision;
    private BigDecimal costoEnvio;
    private BigDecimal total;
    private boolean retiroPersonal;
    /** pendiente | pagado | impago */
    private String estadoPago;
    /** Item de catálogo del producto, para abrir su detalle (cuando ya está pagado). */
    private Long catalogoId;
    private Long itemId;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaRefDto {
        private Long identificador;
        private String fecha;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ProductoRefDto {
        private Long identificador;
        private String descripcion;
    }
}
