package com.tpo.backend.sector.entity;

import com.tpo.backend.empleado.entity.EmpleadoEntity;
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

    @ManyToOne
    @JoinColumn(name = "responsablesector")
    private EmpleadoEntity responsableSector;
}
