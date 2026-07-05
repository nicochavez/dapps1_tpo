package com.tpo.backend.catalogo.entity;

import com.tpo.backend.empleado.entity.EmpleadoEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "catalogos")
@Data
@NoArgsConstructor
public class CatalogoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "descripcion", nullable = false)
    private String descripcion;

    @ManyToOne
    @JoinColumn(name = "responsable", nullable = false)
    private EmpleadoEntity responsable;

    /**
     * Subasta a la que quedo asignado el catalogo. Es el lado inverso del vinculo
     * {@code subastas.catalogo}; se guarda el id directo (no FK mapeada) para evitar la
     * dependencia circular entre {@link com.tpo.backend.subasta.entity.SubastaEntity} y este.
     */
    @Column(name = "subasta")
    private Long subasta;
}
