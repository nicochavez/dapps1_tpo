package com.tpo.backend.mediospago.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

@Data
@SuperBuilder
@NoArgsConstructor
@AllArgsConstructor
public abstract class MedioPagoDto {
    private Long identificador;
    private String tipo;
    private String moneda;
    private boolean internacional;
    private boolean verificado;
    private boolean vigente;
    private String detalle;
}
