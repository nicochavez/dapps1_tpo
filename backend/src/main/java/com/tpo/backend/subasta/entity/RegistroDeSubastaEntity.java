package com.tpo.backend.subasta.entity;

import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.duenio.entity.DuenioEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Entity
@Table(name = "registrodesubasta")
@Data
@NoArgsConstructor
public class RegistroDeSubastaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "subasta", nullable = false)
    private SubastaEntity subasta;

    @ManyToOne
    @JoinColumn(name = "duenio", nullable = false)
    private DuenioEntity duenio;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private ProductoEntity producto;

    /** Ganador. NULL cuando compra la empresa (ver compradorEmpresa, RF-39). */
    @ManyToOne
    @JoinColumn(name = "cliente")
    private ClienteEntity cliente;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    /** RF-39: true cuando nadie pujo y la empresa compra al precio base. */
    @Column(name = "comprador_empresa")
    private Boolean compradorEmpresa;
}
