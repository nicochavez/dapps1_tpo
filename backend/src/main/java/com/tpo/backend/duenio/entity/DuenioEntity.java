package com.tpo.backend.duenio.entity;

import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.persona.PersonaEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "duenios")
@Data
@NoArgsConstructor
public class DuenioEntity {

    @Id
    @Column(name = "identificador")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private PersonaEntity persona;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "verificacionfinanciera")
    private Boolean verificacionFinanciera;

    @Column(name = "verificacionjudicial")
    private Boolean verificacionJudicial;

    @Column(name = "calificacionriesgo")
    private Integer calificacionRiesgo;

    @ManyToOne
    @JoinColumn(name = "verificador", nullable = false)
    private EmpleadoEntity verificador;
}
