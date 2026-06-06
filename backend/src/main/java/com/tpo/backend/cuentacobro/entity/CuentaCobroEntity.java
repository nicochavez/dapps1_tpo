package com.tpo.backend.cuentacobro.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "cuentas_cobro")
@Data
@NoArgsConstructor
public class CuentaCobroEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    // En el ERD la columna es 'duenio' (FK a duenios); se conserva el nombre Java por compatibilidad.
    @Column(name = "duenio", nullable = false)
    private Long cliente;

    @Column(name = "banco", nullable = false)
    private String banco;

    @Column(name = "numero_cuenta", nullable = false)
    private String numeroCuenta;

    @Column(name = "moneda", nullable = false)
    private String moneda;

    @Column(name = "pais")
    private String pais;
}
