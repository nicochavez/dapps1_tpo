package com.tpo.backend.coleccion.entity;

import com.tpo.backend.duenio.entity.DuenioEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Agrupacion de productos declarada por un dueno (RF de colecciones).
 * Ver {@code newErd.sql} tabla {@code colecciones}.
 */
@Entity
@Table(name = "colecciones")
@Data
@NoArgsConstructor
public class ColeccionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private DuenioEntity duenio;
}
