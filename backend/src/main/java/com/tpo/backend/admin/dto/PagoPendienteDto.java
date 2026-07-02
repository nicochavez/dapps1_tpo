package com.tpo.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

/** Compra con pago pendiente, para el backoffice (listado de deudores). */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class PagoPendienteDto {
    private Long compraId;
    private Long clienteId;
    private String clienteNombre;
    private String documento;
    private String producto;
    private BigDecimal importe;
    private BigDecimal total;
    private String fechaCompra;
    /** true si ya se le asigno una multa pendiente por esta compra. */
    private boolean tieneMultaPendiente;
}
