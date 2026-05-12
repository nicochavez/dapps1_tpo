package com.tpo.backend.auth.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class SetContraseniaRequest {
    @NotNull
    private Long id;
    @NotBlank
    private String contrasenia;
}
