package com.tpo.backend.auth.security;

import com.tpo.backend.auth.config.JwtProperties;
import org.junit.jupiter.api.Test;

import java.util.List;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertNotNull;
import static org.junit.jupiter.api.Assertions.assertNull;
import static org.junit.jupiter.api.Assertions.assertThrows;

class JwtServiceTest {

    private static final String SECRET = "test-secret-key-with-at-least-32-bytes!!";

    private JwtService service(long expirationMs) {
        JwtProperties props = new JwtProperties();
        props.setSecret(SECRET);
        props.setExpirationMs(expirationMs);
        return new JwtService(props);
    }

    @Test
    void generateAndParseRoundTrip() {
        JwtService jwt = service(60_000L);
        String token = jwt.generateToken(42L, "12345678", "user@example.com", List.of("CLIENTE", "DUENIO"));

        AuthenticatedUser user = jwt.parse(token);

        assertNotNull(user);
        assertEquals(42L, user.personaId());
        assertEquals("12345678", user.documento());
        assertEquals(List.of("CLIENTE", "DUENIO"), user.roles());
    }

    @Test
    void parseReturnsNullForTamperedToken() {
        JwtService jwt = service(60_000L);
        String token = jwt.generateToken(1L, "1", "a@b.com", List.of("CLIENTE"));

        assertNull(jwt.parse(token + "x"));
    }

    @Test
    void parseReturnsNullWhenSignedWithDifferentSecret() {
        String token = service(60_000L).generateToken(1L, "1", "a@b.com", List.of("CLIENTE"));

        JwtProperties otherProps = new JwtProperties();
        otherProps.setSecret("another-secret-key-with-32-bytes-minimum!");
        JwtService otherService = new JwtService(otherProps);

        assertNull(otherService.parse(token));
    }

    @Test
    void parseReturnsNullForExpiredToken() {
        JwtService jwt = service(-1_000L); // ya expirado
        String token = jwt.generateToken(1L, "1", "a@b.com", List.of("CLIENTE"));

        assertNull(jwt.parse(token));
    }

    @Test
    void constructorRejectsShortSecret() {
        JwtProperties props = new JwtProperties();
        props.setSecret("too-short");
        assertThrows(IllegalStateException.class, () -> new JwtService(props));
    }
}
