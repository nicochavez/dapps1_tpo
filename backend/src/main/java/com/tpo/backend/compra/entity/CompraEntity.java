package com.tpo.backend.compra.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "compras")
@Data
@NoArgsConstructor
public class CompraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "cliente", nullable = false)
    private Long cliente;

    @Column(name = "subasta", nullable = false)
    private Long subasta;

    @Column(name = "producto", nullable = false)
    private Long producto;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Column(name = "costo_envio", precision = 18, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "total", nullable = false, precision = 18, scale = 2)
    private BigDecimal total;

    @Column(name = "retiro_personal")
    private Boolean retiroPersonal;

    @Column(name = "fecha")
    private OffsetDateTime fecha;
}
