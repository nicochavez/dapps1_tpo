package com.tpo.backend.seguro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "seguros")
@Data
@NoArgsConstructor
public class SeguroEntity {

    @Id
    @Column(name = "nropoliza")
    private String nroPoliza;

    @Column(name = "compania", nullable = false)
    private String compania;

    @Column(name = "polizacombinada")
    private Boolean polizaCombinada;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;
}
