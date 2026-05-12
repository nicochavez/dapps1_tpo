package com.tpo.backend.duenio.entity;

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

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "verificacionfinanciera")
    private Boolean verificacionFinanciera;

    @Column(name = "verificacionjudicial")
    private Boolean verificacionJudicial;

    @Column(name = "calificacionriesgo")
    private Integer calificacionRiesgo;

    @Column(name = "verificador", nullable = false)
    private Long verificador;
}
