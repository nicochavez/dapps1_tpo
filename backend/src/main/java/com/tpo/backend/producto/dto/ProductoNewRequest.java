package com.tpo.backend.producto.dto;

import com.tpo.backend.producto.entity.EstadoProducto;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

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
    private String resenia;
    private EstadoProducto estado;
    /** Fotos del bien, enviadas como partes multipart (RN FormData). */
    private List<MultipartFile> fotos;
}
