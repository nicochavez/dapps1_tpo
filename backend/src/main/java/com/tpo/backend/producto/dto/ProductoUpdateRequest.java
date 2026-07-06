package com.tpo.backend.producto.dto;

import com.tpo.backend.producto.entity.EstadoProducto;
import lombok.Data;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;

@Data
public class ProductoUpdateRequest {
    private String fecha;
    private Boolean disponible;
    private String descripcionCatalogo;
    private String descripcionCompleta;
    private Long revisor;
    private String seguro;
    private String categoria;
    private String subcategoria;
    private String artista;
    private String fechaObra;
    private String resenia;
    private EstadoProducto estado;
    /** Fotos nuevas a agregar; el backend las sube al bucket. */
    private List<MultipartFile> fotos;
}
