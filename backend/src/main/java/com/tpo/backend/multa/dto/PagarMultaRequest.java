package com.tpo.backend.multa.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagarMultaRequest {
    @NotNull
    private Long medioPagoId;
}
