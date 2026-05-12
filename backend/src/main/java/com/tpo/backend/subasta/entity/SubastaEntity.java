package com.tpo.backend.subasta.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.time.LocalTime;

@Entity
@Table(name = "subastas")
@Data
@NoArgsConstructor
public class SubastaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "hora", nullable = false)
    private LocalTime hora;

    @Column(name = "estado")
    private String estado;

    @Column(name = "subastador")
    private Long subastador;

    @Column(name = "ubicacion")
    private String ubicacion;

    @Column(name = "capacidadasistentes")
    private Integer capacidadAsistentes;

    @Column(name = "tienedeposito")
    private Boolean tieneDeposito;

    @Column(name = "seguridadpropia")
    private Boolean seguridadPropia;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "moneda")
    private String moneda;
}
