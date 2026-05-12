package com.tpo.backend.mediospago.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "medios_pago")
@Data
@NoArgsConstructor
public class MedioPagoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "cliente", nullable = false)
    private Long cliente;

    @Column(name = "tipo", nullable = false)
    private String tipo;

    @Column(name = "detalle")
    private String detalle;

    @Column(name = "banco")
    private String banco;

    @Column(name = "numero_cuenta")
    private String numeroCuenta;

    @Column(name = "numero_tarjeta")
    private String numeroTarjeta;

    @Column(name = "pais_banco")
    private String paisBanco;

    @Column(name = "moneda", nullable = false)
    private String moneda;

    @Column(name = "monto_reservado", precision = 18, scale = 2)
    private BigDecimal montoReservado;

    @Column(name = "internacional")
    private Boolean internacional;

    @Column(name = "verificado")
    private Boolean verificado;
}
