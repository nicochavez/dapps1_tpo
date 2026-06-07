package com.tpo.backend.mediospago.dto;

import lombok.Data;
import lombok.EqualsAndHashCode;
import lombok.NoArgsConstructor;
import lombok.experimental.SuperBuilder;

import java.time.LocalDate;

@Data
@SuperBuilder
@NoArgsConstructor
@EqualsAndHashCode(callSuper = true)
public class TarjetaCreditoDto extends MedioPagoDto {
    private String bancoEmisor;
    private String ultimosCuatro;
    private String titular;
    private LocalDate fechaVencimiento;
}
