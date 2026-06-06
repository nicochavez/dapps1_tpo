package com.tpo.backend.common.ws;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Evento publicado en /topic/subastas/{id}.
 * tipo ∈ {nueva-puja, item-actual, item-cerrado, subasta-finalizada}.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class SubastaEventDto {
    private String tipo;
    private Long subastaId;
    private Object payload;
}
