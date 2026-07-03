package com.tpo.backend.admin.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.math.BigDecimal;

/** Condiciones que la empresa propone al aprobar un bien (precio base, comision, catalogo/subasta). */
@Data
public class AprobarProductoRequest {

    /** Catalogo (ligado a una subasta) al que se asigna el item. */
    @NotNull
    private Long catalogoId;

    @NotNull
    @Positive
    private BigDecimal precioBase;

    @NotNull
    @Positive
    private BigDecimal comision;

    // La fecha y hora de inicio NO se fijan aca: las define la subasta a la que
    // pertenece el catalogo. El item hereda ese horario al asignarse.

    /** Ubicacion/lugar de la subasta. Opcional. */
    private String ubicacion;

    /** Moneda en la que se publica el precio base: ARS | USD. Se graba en la subasta del catalogo. */
    private String moneda;

    // La categoria (comun/especial/plata/oro/platino) NO se define por item: es propiedad de la
    // subasta a la que pertenece el catalogo. Se setea al crear la subasta, no al aprobar el bien.
}
