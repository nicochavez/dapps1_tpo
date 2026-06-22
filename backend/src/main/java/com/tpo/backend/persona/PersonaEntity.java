package com.tpo.backend.persona;

import com.tpo.backend.common.entity.PaisEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "personas")
@Data
@NoArgsConstructor
public class PersonaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "documento", nullable = false)
    private String documento;

    @Column(name = "nombre", nullable = false)
    private String nombre;

    @Column(name = "apellido", nullable = false)
    private String apellido;

    @ManyToOne
    @JoinColumn(name = "pais_origen")
    private PaisEntity paisOrigen;

    @Column(name = "foto")
    private byte[] foto;

    @Column(name = "foto_dni_frente")
    private byte[] fotoDniFrente;

    @Column(name = "foto_dni_dorso")
    private byte[] fotoDniDorso;

    /** pendiente | aprobado | rechazado */
    @Column(name = "estado")
    private String estado;

    @Column(name = "fecha_registro")
    private OffsetDateTime fechaRegistro;
}
