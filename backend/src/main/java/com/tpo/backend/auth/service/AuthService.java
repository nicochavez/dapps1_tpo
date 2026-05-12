package com.tpo.backend.auth.service;

import com.tpo.backend.auth.dto.LoginRequest;
import com.tpo.backend.auth.dto.LoginResponse;
import com.tpo.backend.auth.dto.RegisterRequest;
import com.tpo.backend.auth.dto.RegisterResponse;
import com.tpo.backend.auth.dto.SetContraseniaRequest;
import com.tpo.backend.common.exception.BadRequestException;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;

    public AuthService(UsuarioRepository usuarioRepository,
                       PersonaRepository personaRepository) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException("El usuario ya completo su registro.");
        }

        PersonaEntity persona = new PersonaEntity();
        persona.setNombre(request.getNombre() + " " + request.getApellido());
        persona.setDocumento("");
        persona.setEstado("activo");
        persona = personaRepository.save(persona);

        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setEmail(email);
        usuario.setPasswordHash(request.getContrasenia());
        usuario.setPersonaId(persona.getId());
        usuario.setActivo(true);
        usuario.setUltimoAcceso(OffsetDateTime.now());
        usuario = usuarioRepository.save(usuario);

        return new RegisterResponse(usuario.getId());
    }

    @Transactional
    public LoginResponse login(LoginRequest request) {
        String documento = request.getDocumento();
        Optional<PersonaEntity> personaOpt = personaRepository.findAll().stream()
                .filter(p -> documento.equals(p.getDocumento()))
                .findFirst();

        if (personaOpt.isEmpty()) {
            throw new UnauthorizedException("Credenciales invalidas.");
        }

        UsuarioEntity usuario = usuarioRepository.findByPersonaId(personaOpt.get().getId())
                .orElseThrow(() -> new UnauthorizedException("Credenciales invalidas."));

        if (!usuario.getPasswordHash().equals(request.getContrasenia())) {
            throw new UnauthorizedException("Credenciales invalidas.");
        }

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new UnauthorizedException("Usuario inactivo.");
        }

        usuario.setUltimoAcceso(OffsetDateTime.now());
        usuarioRepository.save(usuario);

        return new LoginResponse("mock-jwt-token-for-" + documento);
    }

    @Transactional
    public void setContrasenia(SetContraseniaRequest request) {
        if (request.getContrasenia() == null || request.getContrasenia().isBlank()) {
            throw new BadRequestException("La contrasenia no puede estar vacia.");
        }
        UsuarioEntity usuario = usuarioRepository.findById(request.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + request.getId()));
        usuario.setPasswordHash(request.getContrasenia());
        usuarioRepository.save(usuario);
    }
}
