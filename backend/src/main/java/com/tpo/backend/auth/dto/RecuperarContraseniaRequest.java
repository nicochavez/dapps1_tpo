package com.tpo.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

/** Solicitud de recupero de contrasenia: se identifica al usuario por su DNI. */
@Data
public class RecuperarContraseniaRequest {

    @NotBlank
    private String documento;
}
