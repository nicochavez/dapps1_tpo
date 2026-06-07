package com.tpo.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class SetContraseniaRequest {
    @NotBlank
    @Email
    private String email;
    private String contraseniaActual;
    @NotBlank
    private String contrasenia;
}
