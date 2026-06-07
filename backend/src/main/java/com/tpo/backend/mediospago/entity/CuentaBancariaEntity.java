package com.tpo.backend.mediospago.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "medios_cuenta_bancaria")
@PrimaryKeyJoinColumn(name = "medio_pago")
@DiscriminatorValue("cuenta_bancaria")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class CuentaBancariaEntity extends MedioPagoEntity {

    @Column(name = "banco", nullable = false)
    private String banco;

    @Column(name = "numero_cuenta", nullable = false)
    private String numeroCuenta;

    @Column(name = "titular")
    private String titular;

    @Column(name = "monto_reservado", precision = 18, scale = 2)
    private BigDecimal montoReservado;
}
