package com.tpo.backend.mediospago.entity;

import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Table(name = "medios_pago")
@Inheritance(strategy = InheritanceType.JOINED)
@DiscriminatorColumn(name = "tipo", discriminatorType = DiscriminatorType.STRING)
@Data
@NoArgsConstructor
public abstract class MedioPagoEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @Column(name = "cliente", nullable = false)
    private Long cliente;

    @Column(name = "moneda", nullable = false)
    private String moneda;

    @Column(name = "internacional")
    private Boolean internacional = false;

    @Column(name = "verificado")
    private Boolean verificado = true;

    @Column(name = "vigente")
    private Boolean vigente = true;

    @Column(name = "detalle")
    private String detalle;
}
