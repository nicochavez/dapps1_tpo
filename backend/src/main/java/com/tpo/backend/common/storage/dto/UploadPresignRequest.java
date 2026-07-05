package com.tpo.backend.common.storage.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class UploadPresignRequest {
    @NotBlank
    private String contentType;
}
