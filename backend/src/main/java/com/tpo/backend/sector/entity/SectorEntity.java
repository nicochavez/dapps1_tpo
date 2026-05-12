package com.tpo.backend.sector.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "sectores")
@Data
@NoArgsConstructor
public class SectorEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "nombresector", nullable = false)
    private String nombreSector;

    @Column(name = "codigosector")
    private String codigoSector;

    @Column(name = "responsablesector")
    private Long responsableSector;
}
