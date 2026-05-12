package com.tpo.backend.subasta.entity;

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

    @Column(name = "matricula")
    private String matricula;

    @Column(name = "region")
    private String region;
}
