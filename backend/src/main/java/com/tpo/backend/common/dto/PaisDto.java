package com.tpo.backend.common.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class PaisDto {
    private Integer numero;
    private String nombre;
    private String nombreCorto;
    private String nacionalidad;
}
