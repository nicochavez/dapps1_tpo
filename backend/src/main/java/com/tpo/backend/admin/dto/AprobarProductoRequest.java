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

    /** Fecha de la subasta (ISO yyyy-MM-dd). Opcional: si se informa, actualiza la subasta del catalogo. */
    private String fecha;

    /** Hora de la subasta (ISO HH:mm o HH:mm:ss). Opcional. */
    private String hora;

    /** Ubicacion/lugar de la subasta. Opcional. */
    private String ubicacion;

    /** Categoria minima de usuario que puede pujar (comun, especial, plata, oro, platino). Opcional. */
    private String categoria;
}
