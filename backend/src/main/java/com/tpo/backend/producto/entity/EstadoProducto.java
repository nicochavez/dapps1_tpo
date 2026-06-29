package com.tpo.backend.producto.entity;

/**
 * Ciclo de vida de un articulo propuesto por un dueno.
 *
 * <pre>
 *   en_revision ──aprobar(empresa)──▶ propuesta_enviada ──aceptar(dueno)──▶ aceptado_por_usuario ──▶ incluido_en_subasta
 *        │                                   │
 *        └──rechazar(empresa)──▶ rechazado   └──rechazar(dueno)──▶ rechazado_por_usuario
 * </pre>
 */
public enum EstadoProducto {
    /** Pendiente de inspeccion por la empresa (estado inicial al publicarse). */
    en_revision,
    /** Rechazado por la empresa durante la inspeccion (con motivo y cargo de devolucion). */
    rechazado,
    /** La empresa acepto el bien y envio condiciones (precio base, comision, subasta); falta el dueno. */
    propuesta_enviada,
    /** El dueno acepto las condiciones propuestas. */
    aceptado_por_usuario,
    /** El dueno rechazo las condiciones propuestas. */
    rechazado_por_usuario,
    /** El item ya quedo cargado en un catalogo subastado. */
    incluido_en_subasta
}
