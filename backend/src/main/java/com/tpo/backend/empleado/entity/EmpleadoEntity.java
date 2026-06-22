package com.tpo.backend.empleado.entity;

import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.sector.entity.SectorEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "empleados")
@Data
@NoArgsConstructor
public class EmpleadoEntity {

    @Id
    @Column(name = "identificador")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private PersonaEntity persona;

    @Column(name = "cargo")
    private String cargo;

    @ManyToOne
    @JoinColumn(name = "sector")
    private SectorEntity sector;
}
