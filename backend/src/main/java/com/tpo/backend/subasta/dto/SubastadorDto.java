package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubastadorDto {
    private Long identificador;
    private String nombre;
    private String matricula;
}
