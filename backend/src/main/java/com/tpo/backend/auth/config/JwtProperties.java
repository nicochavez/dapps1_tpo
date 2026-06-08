package com.tpo.backend.auth.config;

import org.springframework.boot.context.properties.ConfigurationProperties;

/**
 * Configuracion tipada del JWT (RF-05). Se enlaza con las claves {@code app.jwt.*}.
 */
@ConfigurationProperties(prefix = "app.jwt")
public class JwtProperties {

    /** Clave secreta para firmar/verificar (HS256). Debe tener al menos 32 bytes. */
    private String secret;

    /** Tiempo de vida del token en milisegundos. */
    private long expirationMs = 86_400_000L;

    public String getSecret() {
        return secret;
    }

    public void setSecret(String secret) {
        this.secret = secret;
    }

    public long getExpirationMs() {
        return expirationMs;
    }

    public void setExpirationMs(long expirationMs) {
        this.expirationMs = expirationMs;
    }
}
