package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ItemCatalogoDto {
    private Long identificador;
    private Integer numeroPieza;
    private String descripcion;
    private BigDecimal precioBase;
    private BigDecimal comision;
    private String subastado;
    private List<FotoRefDto> imagenes;
}
