package com.tpo.backend.mediospago.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class ChequeCertificadoDto extends MedioPagoDto {
    private String banco;
    private String numeroCheque;
    private BigDecimal montoCertificado;
    private LocalDate fechaVencimiento;
}
