package com.tpo.backend.producto.dto;

import com.tpo.backend.producto.entity.EstadoProducto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.List;

@Data
public class ProductoNewRequest {
    @NotBlank
    private String fecha;
    @NotNull
    private Boolean disponible;
    private String descripcionCatalogo;
    @NotBlank
    private String descripcionCompleta;
    /** Empleado revisor; si no se informa, el service asigna el verificador por defecto. */
    private Long revisor;
    private String seguro;
    private String categoria;
    private String subcategoria;
    private String artista;
    private String fechaObra;
    private String resenia;
    private EstadoProducto estado;
    /** Object keys de las fotos, ya subidas al bucket via presigned PUT. */
    private List<String> fotos;
}
