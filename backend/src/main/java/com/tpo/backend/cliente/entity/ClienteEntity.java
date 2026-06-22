package com.tpo.backend.cliente.entity;

import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.persona.PersonaEntity;
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

    @OneToOne
    @MapsId
    @JoinColumn(name = "identificador")
    private PersonaEntity persona;

    @Column(name = "numeropais")
    private Integer numeroPais;

    @Column(name = "admitido")
    private Boolean admitido;

    @Column(name = "categoria")
    private String categoria;

    @ManyToOne
    @JoinColumn(name = "verificador", nullable = false)
    private EmpleadoEntity verificador;
}
