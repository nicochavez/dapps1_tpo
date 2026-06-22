package com.tpo.backend.puja.entity;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.subasta.entity.AsistenteEntity;
import jakarta.persistence.*;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.OffsetDateTime;

@Entity
@Table(name = "pujos")
@Data
@NoArgsConstructor
public class PujaEntity {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    @Column(name = "identificador")
    private Long id;

    @ManyToOne
    @JoinColumn(name = "asistente", nullable = false)
    private AsistenteEntity asistente;

    @ManyToOne
    @JoinColumn(name = "item", nullable = false)
    private ItemCatalogoEntity item;

    @Column(name = "importe", nullable = false, precision = 18, scale = 2)
    private BigDecimal importe;

    @Column(name = "fecha")
    private OffsetDateTime fecha;

    @Column(name = "ganador")
    private Boolean ganador;
}
