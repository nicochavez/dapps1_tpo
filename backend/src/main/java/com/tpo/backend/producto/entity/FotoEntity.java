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

    @Column(name = "producto", nullable = false)
    private Long producto;

    @Lob
    @Column(name = "foto", nullable = false)
    private byte[] foto;
}
