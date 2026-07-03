package com.tpo.backend.admin.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/** Medio de pago pendiente de verificacion, para el backoffice de empleados. */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MedioPagoPendienteDto {
    private Long medioPagoId;
    private String tipo;
    private String moneda;
    private Boolean internacional;
    private String detalle;
    private Long clienteId;
    private String clienteNombre;
    private String documento;
}
