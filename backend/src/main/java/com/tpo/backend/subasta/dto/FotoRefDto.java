package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class FotoRefDto {
    private Long identificador;
    private String url;
}
