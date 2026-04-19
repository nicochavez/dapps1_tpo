package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CatalogoDto {
    private Long identificador;
    private String descripcion;
    private List<ItemCatalogoDto> items;
}
