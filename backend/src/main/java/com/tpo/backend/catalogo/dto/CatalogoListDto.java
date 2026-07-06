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
    /** Imagen de portada del catalogo (primera foto del primer item). */
    private String image;
    /** Categoria tematica de los items (ej: la categoria del producto del primer item). */
    private String itemCategory;
    /** Subasta a la que pertenece el catalogo (1:1); lleva la metadata de negocio. */
    private SubastaResumenDto subasta;
    private List<ItemDto> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class SubastaResumenDto {
        private Long identificador;
        private String estado;
        private String categoria;
        private String fecha;
        private String hora;
        /** true = el scheduler ya arrancó al menos un lote; false = upcoming (abierta pero sin actividad). */
        private Boolean enVivo;
        /** Moneda en la que corre la subasta (ARS | USD). Define el símbolo/etiqueta de todos los precios. */
        private String moneda;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemDto {
        private Long identificador;
        private String descripcion;
        private BigDecimal precioBase;
        private String subastado;
        private String imagenPrincipal;
        private Integer numeroPieza;
        private BigDecimal comision;
        /** Mejor oferta actual del item (null si no hay pujas o el usuario no esta autenticado). */
        private BigDecimal currentBid;
        /** Importe adjudicado si el lote ya fue subastado. */
        private BigDecimal importeAdjudicado;
        /** Estado del lote para la UI: en_puja | subastado | pendiente. */
        private String estadoLote;
        /** Momento de cierre del lote (ISO 8601). Solo presente cuando estadoLote = en_puja. */
        private String cierreProgramado;
    }
}
