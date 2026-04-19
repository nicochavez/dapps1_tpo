package com.tpo.backend.cuentacobro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class CuentaCobroDto {
    private Long identificador;
    private String banco;
    private String numeroCuenta;
    private String moneda;
    private String pais;
}
