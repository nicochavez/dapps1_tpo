package com.tpo.backend.puja.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.List;

/**
 * Participación del cliente en una subasta: el catálogo, sus pujas y, por cada
 * item en el que pujó, el historial completo (anonimizado por numeroPostor).
 * Alimenta la pantalla "My Bids".
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class ParticipacionDto {
    private Long subastaId;
    private Long catalogoId;
    private String catalogoDescripcion;
    private String catalogoImage;
    private String categoria;
    private String itemCategory;
    /** La subasta está abierta (participación activa). */
    private boolean activa;
    /** El cliente ganó al menos un item de esta subasta. */
    private boolean won;
    private List<MiPujaResumen> misPujas;
    private List<ItemParticipacion> items;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class MiPujaResumen {
        private Long itemId;
        private BigDecimal importe;
        private boolean ganador;
        private String fecha;
    }

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ItemParticipacion {
        private Long itemId;
        private String descripcion;
        private String imagen;
        private boolean enPuja;
        private List<PujaHistorialDto> historial;
    }
}
