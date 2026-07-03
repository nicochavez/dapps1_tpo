package com.tpo.backend.producto.entity;

import com.tpo.backend.duenio.entity.DuenioEntity;
import com.tpo.backend.empleado.entity.EmpleadoEntity;
import com.tpo.backend.seguro.entity.SeguroEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;

@Entity
@Table(name = "productos")
@Data
@NoArgsConstructor
public class ProductoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "fecha")
    private LocalDate fecha;

    @Column(name = "disponible")
    private Boolean disponible;

    @Column(name = "descripcioncatalogo")
    private String descripcionCatalogo;

    @Column(name = "descripcioncompleta", nullable = false)
    private String descripcionCompleta;

    @Column(name = "categoria")
    private String categoria;

    @Column(name = "subcategoria")
    private String subcategoria;

    @ManyToOne
    @JoinColumn(name = "revisor", nullable = false)
    private EmpleadoEntity revisor;

    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private DuenioEntity duenio;

    /**
     * Nuevo propietario tras adjudicarse el item: id de la PERSONA ganadora (o del admin si no
     * hubo pujas). Se guarda el id de persona directo (no FK a 'duenios') para no exigir que el
     * comprador sea dueno; {@code duenio} se conserva como el consignante original ("My Items").
     */
    @Column(name = "nuevo_duenio")
    private Long nuevoDuenio;

    @ManyToOne
    @JoinColumn(name = "seguro")
    private SeguroEntity seguro;

    /** Metadatos de arte/diseno (RF-15). */
    @Column(name = "artista")
    private String artista;

    /** Fecha/epoca de la obra. Texto libre ("1960", "Siglo XV", etc.). */
    @Column(name = "fecha_obra")
    private String fechaObra;

    @Column(name = "resena_historica")
    private String resenia;

    @Column(name = "motivo_rechazo")
    private String motivoRechazo;

    @Enumerated(EnumType.STRING)
    @Column(name = "estado", nullable = false)
    private EstadoProducto estado;
}
