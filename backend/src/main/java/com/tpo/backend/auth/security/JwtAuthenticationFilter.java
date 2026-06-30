package com.tpo.backend.auth.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Valida el header {@code Authorization: Bearer <jwt>} en cada peticion y, si es
 * valido, coloca el {@link AuthenticatedUser} en el {@code SecurityContext}.
 * Es indulgente: si no hay token o es invalido continua la cadena sin autenticar
 * (las reglas de {@code SecurityConfig} deciden si el recurso requiere auth).
 */
@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(JwtAuthenticationFilter.class);
    private static final String BEARER = "Bearer ";

    private final JwtService jwtService;

    public JwtAuthenticationFilter(JwtService jwtService) {
        this.jwtService = jwtService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");
        if (header == null || !header.startsWith(BEARER)) {
            log.debug("[JWT] {} {} - sin header Authorization", request.getMethod(), request.getRequestURI());
            filterChain.doFilter(request, response);
            return;
        }
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            filterChain.doFilter(request, response);
            return;
        }
        AuthenticatedUser user = jwtService.parse(header.substring(BEARER.length()));
        if (user != null) {
            List<SimpleGrantedAuthority> authorities = user.roles().stream()
                    .map(r -> new SimpleGrantedAuthority("ROLE_" + r))
                    .toList();
            var authentication = new UsernamePasswordAuthenticationToken(user, null, authorities);
            authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
            SecurityContextHolder.getContext().setAuthentication(authentication);
            log.debug("[JWT] {} {} - autenticado como personaId={} roles={}", request.getMethod(), request.getRequestURI(), user.personaId(), user.roles());
        } else {
            log.warn("[JWT] {} {} - token invalido o expirado", request.getMethod(), request.getRequestURI());
        }
        filterChain.doFilter(request, response);
    }
}
