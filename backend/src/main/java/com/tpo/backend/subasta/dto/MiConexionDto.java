package com.tpo.backend.subasta.dto;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Estado de conexion del cliente autenticado respecto de una subasta, para que la app decida
 * si mostrar el alert de "unirse", entrar directo (ya conectado) o avisar que esta en otra.
 */
@Data
@AllArgsConstructor
@NoArgsConstructor
public class MiConexionDto {
    /** true si el cliente ya esta conectado (conectado=true) a ESTA subasta. */
    private boolean conectadoAqui;
    /** numeroPostor del cliente en esta subasta, si tiene fila de asistente. */
    private Integer numeroPostor;
    /** id de otra subasta ABIERTA donde el cliente sigue conectado (bloquea unirse aqui), o null. */
    private Long conectadoEnOtra;
}
