package com.tpo.backend.cliente.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "clientes")
@Data
@NoArgsConstructor
public class ClienteEntity {

    @Id
    @Column(name = "identificador")
    private Long id;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "admitido")
    private Boolean admitido;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "verificador", nullable = false)
    private Long verificador;
}
