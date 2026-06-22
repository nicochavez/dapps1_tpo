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

    // byte[] sin @Lob mapea a bytea (coincide con el ERD); con @Lob Hibernate usaria oid.
    @Column(name = "foto", nullable = false)
    private byte[] foto;
}
