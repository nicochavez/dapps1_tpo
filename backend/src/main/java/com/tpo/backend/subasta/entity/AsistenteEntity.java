package com.tpo.backend.subasta.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asistentes")
@Data
@NoArgsConstructor
public class AsistenteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "numeropostor", nullable = false)
    private Integer numeroPostor;

    @Column(name = "cliente", nullable = false)
    private Long cliente;

    @Column(name = "subasta", nullable = false)
    private Long subasta;
}
