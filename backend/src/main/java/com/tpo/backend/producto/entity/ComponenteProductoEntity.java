package com.tpo.backend.producto.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Componente/pieza que integra un producto (ej. "estuche", "certificado").
 * Ver {@code newErd.sql} tabla {@code componentes_producto}.
 */
@Entity
@Table(name = "componentes_producto")
@Data
@NoArgsConstructor
public class ComponenteProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private ProductoEntity producto;

    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    @Column(name = "cantidad")
    private Integer cantidad;
}
