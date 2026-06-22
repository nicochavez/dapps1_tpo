package com.tpo.backend.subasta.entity;

import com.tpo.backend.cliente.entity.ClienteEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "asistentes")
@Data
@NoArgsConstructor
public class AsistenteEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "numeropostor", nullable = false)
    private Integer numeroPostor;

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private ClienteEntity cliente;

    @ManyToOne
    @JoinColumn(name = "subasta", nullable = false)
    private SubastaEntity subasta;

    /** true = espectador (no puede pujar); false/null = postor habilitado. */
    @Column(name = "espectador")
    private Boolean espectador;
}
