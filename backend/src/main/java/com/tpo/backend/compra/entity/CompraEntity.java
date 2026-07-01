package com.tpo.backend.compra.entity;

import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.direccion.entity.DireccionEntity;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "compras")
@Data
@NoArgsConstructor
public class CompraEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "cliente", nullable = false)
    private ClienteEntity cliente;

    @ManyToOne
    @JoinColumn(name = "subasta", nullable = false)
    private SubastaEntity subasta;

    @ManyToOne
    @JoinColumn(name = "producto", nullable = false)
    private ProductoEntity producto;

    @ManyToOne
    @JoinColumn(name = "medio_pago")
    private MedioPagoEntity medioPago;

    @ManyToOne
    @JoinColumn(name = "direccion_envio")
    private DireccionEntity direccionEnvio;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "comision", nullable = false, precision = 18, scale = 2)
    private BigDecimal comision;

    @Column(name = "costo_envio", precision = 18, scale = 2)
    private BigDecimal costoEnvio;

    @Column(name = "total", nullable = false, precision = 18, scale = 2)
    private BigDecimal total;

    @Column(name = "retiro_personal")
    private Boolean retiroPersonal;

    /** pendiente | pagado | impago */
    @Column(name = "estado_pago")
    private String estadoPago;

    @Column(name = "fecha")
    private OffsetDateTime fecha;
}
