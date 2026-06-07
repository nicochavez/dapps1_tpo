package com.tpo.backend.mediospago.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.Data;

import java.time.LocalDate;

@Data
public class TarjetaCreditoRequest {
    private String bancoEmisor;
    @NotBlank
    @Size(min = 4, max = 4)
    private String ultimosCuatro;
    @NotBlank
    private String titular;
    @NotNull
    private LocalDate fechaVencimiento;
    @NotBlank
    @Pattern(regexp = "ARS|USD")
    private String moneda;
    private boolean internacional;
}
