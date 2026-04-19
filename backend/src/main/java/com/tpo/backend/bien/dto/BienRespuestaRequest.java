package com.tpo.backend.bien.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class BienRespuestaRequest {
    @NotNull
    private Boolean aceptado;
}
