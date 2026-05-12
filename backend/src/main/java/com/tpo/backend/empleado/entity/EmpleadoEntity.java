package com.tpo.backend.empleado.entity;

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

    @Column(name = "cargo")
    private String cargo;

    @Column(name = "sector")
    private Integer sector;
}
