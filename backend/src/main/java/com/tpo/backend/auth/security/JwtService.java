package com.tpo.backend.auth.security;

import com.tpo.backend.auth.config.JwtProperties;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.List;

/**
 * Genera y valida los JWT firmados con HS256 (RF-05).
 * El subject es el {@code personaId}; los roles y el documento viajan como claims.
 */
@Service
public class JwtService {

    private final SecretKey key;
    private final long expirationMs;

    public JwtService(JwtProperties properties) {
        if (properties.getSecret() == null || properties.getSecret().getBytes(StandardCharsets.UTF_8).length < 32) {
            throw new IllegalStateException(
                    "app.jwt.secret debe estar configurado y tener al menos 32 bytes para HS256.");
        }
        this.key = Keys.hmacShaKeyFor(properties.getSecret().getBytes(StandardCharsets.UTF_8));
        this.expirationMs = properties.getExpirationMs();
    }

    public String generateToken(Long personaId, String documento, String email, List<String> roles) {
        Date now = new Date();
        Date expiry = new Date(now.getTime() + expirationMs);
        return Jwts.builder()
                .subject(String.valueOf(personaId))
                .claim("documento", documento)
                .claim("email", email)
                .claim("roles", roles)
                .issuedAt(now)
                .expiration(expiry)
                .signWith(key)
                .compact();
    }

    /**
     * Valida firma y expiracion y devuelve el principal, o {@code null} si el token es invalido.
     */
    @SuppressWarnings("unchecked")
    public AuthenticatedUser parse(String token) {
        try {
            Claims claims = Jwts.parser()
                    .verifyWith(key)
                    .build()
                    .parseSignedClaims(token)
                    .getPayload();

            Long personaId = Long.valueOf(claims.getSubject());
            String documento = claims.get("documento", String.class);
            List<String> roles = claims.get("roles", List.class);
            return new AuthenticatedUser(personaId, documento, roles != null ? roles : List.of());
        } catch (JwtException | IllegalArgumentException e) {
            return null;
        }
    }
}
