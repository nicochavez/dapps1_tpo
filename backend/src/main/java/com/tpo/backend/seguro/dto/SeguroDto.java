package com.tpo.backend.seguro.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class SeguroDto {
    private String nroPoliza;
    private String compania;
    private String polizaCombinada;
    private BigDecimal importe;
    private ContactoDto contactoCompania;

    @Data
    @AllArgsConstructor
    @NoArgsConstructor
    public static class ContactoDto {
        private String telefono;
        private String email;
    }
}
