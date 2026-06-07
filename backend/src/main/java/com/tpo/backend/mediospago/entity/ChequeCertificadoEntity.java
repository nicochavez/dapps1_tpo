package com.tpo.backend.mediospago.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;

@Entity
@Table(name = "medios_cheque_certificado")
@PrimaryKeyJoinColumn(name = "medio_pago")
@DiscriminatorValue("cheque_certificado")
@Data
@EqualsAndHashCode(callSuper = true)
@NoArgsConstructor
public class ChequeCertificadoEntity extends MedioPagoEntity {

    @Column(name = "banco", nullable = false)
    private String banco;

    @Column(name = "numero_cheque")
    private String numeroCheque;

    @Column(name = "monto_certificado", precision = 18, scale = 2, nullable = false)
    private BigDecimal montoCertificado;

    @Column(name = "fecha_vencimiento", nullable = false)
    private LocalDate fechaVencimiento;
}
