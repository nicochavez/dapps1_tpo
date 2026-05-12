package com.tpo.backend.multa.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "multas")
@Data
@NoArgsConstructor
public class MultaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "cliente", nullable = false)
    private Long cliente;

    @Column(name = "compra")
    private Long compra;

    @Column(name = "importe_original", nullable = false, precision = 18, scale = 2)
    private BigDecimal importeOriginal;

    @Column(name = "multa", nullable = false, precision = 18, scale = 2)
    private BigDecimal multa;

    @Column(name = "estado", nullable = false)
    private String estado;

    @Column(name = "fecha_limite")
    private OffsetDateTime fechaLimite;
}
