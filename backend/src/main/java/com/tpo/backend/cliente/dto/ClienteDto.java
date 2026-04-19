package com.tpo.backend.cliente.dto;

import com.tpo.backend.common.dto.PaisDto;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@AllArgsConstructor
@NoArgsConstructor
public class ClienteDto {
    private Long identificador;
    private String documento;
    private String nombre;
    private String direccion;
    private String estado;
    private String categoria;
    private String admitido;
    private PaisDto pais;
}
