package com.tpo.backend.persona;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

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

    /** Estado de registro: pendiente | aprobado | rechazado (columna estado_registro del ERD). */
    @Column(name = "estado_registro")
    private String estado;

    @Column(name = "foto")
    private byte[] foto;
}
