package com.tpo.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class RegisterRequest {
    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    private String documento;

    @Email
    @NotBlank
    private String email;

    private Integer numeroPais = 32;

    private boolean verificado = false;
}