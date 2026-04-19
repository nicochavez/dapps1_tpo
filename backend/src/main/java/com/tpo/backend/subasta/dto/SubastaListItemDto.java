package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubastaListItemDto {
    private Long identificador;
    private String fecha;
    private String hora;
    private String estado;
    private String ubicacion;
    private String categoria;
    private String moneda;
    private SubastadorDto subastador;
}
