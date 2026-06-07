package com.tpo.backend.mediospago.dto;

import jakarta.validation.constraints.DecimalMin;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;

@Data
public class ChequeCertificadoRequest {
    @NotBlank
    private String banco;
    private String numeroCheque;
    @NotNull
    @DecimalMin("0.01")
    private BigDecimal montoCertificado;
    @NotNull
    private LocalDate fechaVencimiento;
    @NotBlank
    @Pattern(regexp = "ARS|USD")
    private String moneda;
    private boolean internacional;
}
