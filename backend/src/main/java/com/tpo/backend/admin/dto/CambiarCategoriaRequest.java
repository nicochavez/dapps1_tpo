package com.tpo.backend.admin.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class CambiarCategoriaRequest {
    /** comun | especial | plata | oro | platino */
    @NotBlank
    private String categoria;
}
