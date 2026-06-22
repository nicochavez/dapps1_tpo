package com.tpo.backend.direccion.entity;

import com.tpo.backend.common.entity.PaisEntity;
import com.tpo.backend.persona.PersonaEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "direcciones")
@Data
@NoArgsConstructor
public class DireccionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "persona", nullable = false)
    private PersonaEntity persona;

    @Column(name = "nombre")
    private String nombre;

    @Column(name = "calle")
    private String calle;

    @Column(name = "numero")
    private String numero;

    @Column(name = "piso")
    private String piso;

    @Column(name = "departamento")
    private String departamento;

    @Column(name = "ciudad")
    private String ciudad;

    @Column(name = "provincia")
    private String provincia;

    @Column(name = "codigo_postal")
    private String codigoPostal;

    @ManyToOne
    @JoinColumn(name = "pais")
    private PaisEntity pais;

    @Column(name = "favorito")
    private Boolean favorito;
}
