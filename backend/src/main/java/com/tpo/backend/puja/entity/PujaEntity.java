package com.tpo.backend.puja.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pujos")
@Data
@NoArgsConstructor
public class PujaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "asistente", nullable = false)
    private Long asistente;

    @Column(name = "item", nullable = false)
    private Long item;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "fecha")
    private OffsetDateTime fecha;

    @Column(name = "ganador")
    private Boolean ganador;
}
