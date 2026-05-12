package com.tpo.backend.catalogo.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "catalogos")
@Data
@NoArgsConstructor
public class CatalogoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    @Column(name = "subasta")
    private Long subasta;

    @Column(name = "responsable", nullable = false)
    private Long responsable;
}
