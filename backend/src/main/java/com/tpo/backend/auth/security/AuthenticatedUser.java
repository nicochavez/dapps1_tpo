package com.tpo.backend.auth.security;

import java.util.List;

/**
 * Principal que viaja en el {@code SecurityContext} una vez validado el JWT.
 * {@code personaId} es la PK compartida por personas/clientes/duenios/empleados,
 * por lo que sirve como identidad unica del usuario autenticado.
 */
public record AuthenticatedUser(Long personaId, String documento, List<String> roles) {
}
