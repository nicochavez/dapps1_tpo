package com.tpo.backend.subasta.entity;

import com.tpo.backend.persona.PersonaEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "subastadores")
@Data
@NoArgsConstructor
public class SubastadorEntity {

    @Id
    @Column(name = "identificador")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private PersonaEntity persona;

    @Column(name = "matricula")
    private String matricula;

    @Column(name = "region")
    private String region;
}
