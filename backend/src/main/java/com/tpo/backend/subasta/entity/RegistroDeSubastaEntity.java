package com.tpo.backend.subasta.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "registrodesubasta")
@Data
@NoArgsConstructor
public class RegistroDeSubastaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "subasta", nullable = false)
    private Long subasta;

    @Column(name = "duenio", nullable = false)
    private Long duenio;

    @Column(name = "producto", nullable = false)
    private Long producto;

    /** Ganador. NULL cuando compra la empresa (ver compradorEmpresa, RF-39). */
    @Column(name = "cliente")
    private Long cliente;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    /** RF-39: true cuando nadie pujo y la empresa compra al precio base. */
    @Column(name = "comprador_empresa")
    private Boolean compradorEmpresa;
}
