package com.tpo.backend.compra.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class PagarCompraRequest {
    @NotNull
    private Long medioPagoId;
}
