package com.tpo.backend.catalogo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "itemscatalogo")
@Data
@NoArgsConstructor
public class ItemCatalogoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "catalogo", nullable = false)
    private Long catalogo;

    @Column(name = "producto", nullable = false)
    private Long producto;

    @Column(name = "numeropieza")
    private Integer numeroPieza;

    @Column(name = "preciobase", nullable = false, precision = 18, scale = 2)
    private BigDecimal precioBase;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Column(name = "subastado")
    private Boolean subastado;

    /** Momento programado de cierre automatico del item (se extiende con cada puja). */
    @Column(name = "cierre_programado")
    private OffsetDateTime cierreProgramado;
}
