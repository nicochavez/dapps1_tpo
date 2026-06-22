package com.tpo.backend.notificacion.entity;

import com.tpo.backend.cliente.entity.ClienteEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.OffsetDateTime;

@Entity
@Table(name = "notificaciones")
@Data
@NoArgsConstructor
public class NotificacionEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private ClienteEntity cliente;

    @Column(name = "titulo", nullable = false)
    private String titulo;

    @Column(name = "mensaje", nullable = false)
    private String mensaje;

    @Column(name = "leida")
    private Boolean leida;

    @Column(name = "fecha_creacion")
    private OffsetDateTime fechaCreacion;
}
