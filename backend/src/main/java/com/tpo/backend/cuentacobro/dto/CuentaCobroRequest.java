package com.tpo.backend.cuentacobro.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CuentaCobroRequest {
    @NotBlank
    private String banco;
    @NotBlank
    private String numeroCuenta;
    private String cbu;
    private String swift;
    @NotBlank
    private String moneda;
    @NotBlank
    private String pais;
}
