package com.tpo.backend.common.util;

import java.util.List;

/**
 * Orden de categorias de menor a mayor: comun < especial < plata < oro < platino.
 * Un usuario puede acceder a subastas de su categoria o inferiores (RF-20).
 */
public final class CategoriaUtil {

    private static final List<String> ORDEN = List.of("comun", "especial", "plata", "oro", "platino");

    private CategoriaUtil() {
    }

    /** Rango de la categoria (0 = comun ... 4 = platino). -1 si es desconocida/null. */
    public static int rank(String categoria) {
        if (categoria == null) return -1;
        return ORDEN.indexOf(categoria.toLowerCase());
    }

    /** true si un usuario de categoria {@code usuario} puede acceder a una subasta de categoria {@code subasta}. */
    public static boolean puedeAcceder(String categoriaUsuario, String categoriaSubasta) {
        int rUsuario = rank(categoriaUsuario);
        int rSubasta = rank(categoriaSubasta);
        if (rUsuario < 0 || rSubasta < 0) return true; // sin datos suficientes: no filtrar
        return rSubasta <= rUsuario;
    }
}
