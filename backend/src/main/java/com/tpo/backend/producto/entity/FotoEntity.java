package com.tpo.backend.producto.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "fotos")
@Data
@NoArgsConstructor
public class FotoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private ProductoEntity producto;

    // Object key within the Railway bucket (e.g. "fotos/uuid.jpg"); render URL is a
    // presigned GET derived from this per response. También puede guardar una URL pública
    // absoluta (imagen en internet), que puede superar los 255 chars por defecto.
    @Column(name = "url", nullable = false, length = 2048)
    private String url;
}
