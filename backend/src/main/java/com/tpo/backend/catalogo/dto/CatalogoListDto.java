package com.tpo.backend.catalogo.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CatalogoListDto {
    private Long identificador;
    private String descripcion;
    private Integer cantidadItems;
    private List<ItemDto> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemDto {
        private Long identificador;
        private String descripcion;
        private BigDecimal precioBase;
        private String subastado;
        private String imagenPrincipal;
    }
}
