package com.tpo.backend.auth.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

@Data
public class RegisterRequest {

    // --- Datos personales ---
    @NotBlank
    private String nombre;

    @NotBlank
    private String apellido;

    @NotBlank
    private String documento;

    @Email
    @NotBlank
    private String email;

    // --- Fotos DNI (RF-01) ---
    @NotNull
    private MultipartFile dniFrente;

    @NotNull
    private MultipartFile dniDorso;

    // --- Domicilio legal (RF-01) ---
    @NotBlank
    private String calle;

    @NotBlank
    private String numeroCalle;

    private String piso;

    private String departamento;

    @NotBlank
    private String ciudad;

    private String provincia;

    @NotBlank
    private String codigoPostal;

    // --- País de origen (RF-01) ---
    @NotNull
    private Integer numeroPais;
}
