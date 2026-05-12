package com.tpo.backend.common.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "paises")
@Data
@NoArgsConstructor
public class PaisEntity {

    @Id
    @Column(name = "numero")
    private Integer numero;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "nombrecorto")
    private String nombreCorto;

    @Column(name = "capital", nullable = false)
    private String capital;

    @Column(name = "nacionalidad", nullable = false)
    private String nacionalidad;

    @Column(name = "idiomas", nullable = false)
    private String idiomas;
}
