package com.tpo.backend.mediospago.entity;

import com.tpo.backend.cliente.entity.ClienteEntity;
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

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private ClienteEntity cliente;

    @Column(name = "moneda", nullable = false)
    private String moneda;

    @Column(name = "internacional")
    private Boolean internacional = false;

    // Nace pendiente de verificacion; un empleado lo habilita desde el backoffice.
    @Column(name = "verificado")
    private Boolean verificado = false;

    @Column(name = "vigente")
    private Boolean vigente = true;

    @Column(name = "detalle")
    private String detalle;

    /**
     * Banco a nivel del medio (denormalizado en {@code medios_pago}, ver newErd.sql). Se nombra
     * distinto del atributo {@code banco} de las subclases (cuenta bancaria / cheque) para no
     * colisionar en la jerarquia JOINED: alli cada subtabla tiene su propia columna {@code banco}.
     */
    @Column(name = "banco")
    private String bancoResumen;
}
