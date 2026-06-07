package com.tpo.backend.mediospago.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "medios_tarjeta_credito")
@PrimaryKeyJoinColumn(name = "medio_pago")
@DiscriminatorValue("tarjeta_credito")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class TarjetaCreditoEntity extends MedioPagoEntity {

    @Column(name = "banco_emisor")
    private String bancoEmisor;

    @Column(name = "ultimos_cuatro", length = 4, nullable = false)
    private String ultimosCuatro;

    @Column(name = "titular", nullable = false)
    private String titular;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;
}
