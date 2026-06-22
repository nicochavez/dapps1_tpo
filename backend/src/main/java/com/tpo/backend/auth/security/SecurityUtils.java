package com.tpo.backend.auth.security;

import com.tpo.backend.common.exception.UnauthorizedException;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

/**
 * Acceso al usuario autenticado desde el {@code SecurityContext}, reemplazo del
 * antiguo parseo manual del header en {@code ClienteService}.
 */
public final class SecurityUtils {

    private SecurityUtils() {
    }

    /** Usuario autenticado o {@code null} si la peticion es anonima. */
    public static AuthenticatedUser currentUserOrNull() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getPrincipal() instanceof AuthenticatedUser user) {
            return user;
        }
        return null;
    }

    /** Usuario autenticado o lanza 401 si no hay token valido. */
    public static AuthenticatedUser currentUser() {
        AuthenticatedUser user = currentUserOrNull();
        if (user == null) {
            throw new UnauthorizedException("No hay un usuario autenticado.");
        }
        return user;
    }

    /** Id de persona (= id de cliente/duenio) del usuario autenticado. */
    public static Long currentPersonaId() {
        return currentUser().personaId();
    }
}
