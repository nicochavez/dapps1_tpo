package com.tpo.backend.direccion.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class DireccionRequest {
    @NotBlank
    private String nombre;
    @NotBlank
    private String calle;
    @NotBlank
    private String numero;
    private String piso;
    private String departamento;
    @NotBlank
    private String ciudad;
    private String provincia;
    @NotBlank
    private String codigoPostal;
    @NotNull
    private Integer pais;
    private boolean favorito = false;
}
