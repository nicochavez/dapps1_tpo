package com.tpo.backend.producto.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class ProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible")
    private Boolean disponible;

    @Column(name = "descripcioncatalogo")
    private String descripcionCatalogo;

    @Column(name = "descripcioncompleta", nullable = false)
    private String descripcionCompleta;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "subcategoria")
    private String subcategoria;

    @Column(name = "revisor", nullable = false)
    private Long revisor;

    @Column(name = "duenio", nullable = false)
    private Long duenio;

    @Column(name = "seguro")
    private String seguro;
}
