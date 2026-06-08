package com.tpo.backend.auth.security;

import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Migracion de un solo paso: los usuarios sembrados antes de adoptar BCrypt tienen
 * la clave en texto plano. En el arranque se re-hashea cualquier password que no
 * tenga ya el formato BCrypt ({@code $2...}), para que el login siga funcionando.
 */
@Component
public class PasswordMigrationRunner implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(PasswordMigrationRunner.class);

    private final UsuarioRepository usuarioRepository;
    private final PasswordEncoder passwordEncoder;

    public PasswordMigrationRunner(UsuarioRepository usuarioRepository, PasswordEncoder passwordEncoder) {
        this.usuarioRepository = usuarioRepository;
        this.passwordEncoder = passwordEncoder;
    }

    @Override
    public void run(String... args) {
        int migrated = 0;
        for (UsuarioEntity usuario : usuarioRepository.findAll()) {
            String hash = usuario.getPasswordHash();
            if (hash != null && !hash.isBlank() && !hash.startsWith("$2")) {
                usuario.setPasswordHash(passwordEncoder.encode(hash));
                usuarioRepository.save(usuario);
                migrated++;
            }
        }
        if (migrated > 0) {
            log.info("Migracion de contrasenias a BCrypt: {} usuario(s) actualizados.", migrated);
        }
    }
}
