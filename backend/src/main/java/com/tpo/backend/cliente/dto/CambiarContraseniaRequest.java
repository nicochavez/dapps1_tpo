package com.tpo.backend.cliente.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarContraseniaRequest {

    @NotBlank
    private String contraseniaActual;

    @NotBlank
    private String contraseniaNueva;
}
