package com.tpo.backend.auth.service;

import com.tpo.backend.auth.dto.LoginRequest;
import com.tpo.backend.auth.dto.LoginResponse;
import com.tpo.backend.auth.dto.RegisterRequest;
import com.tpo.backend.auth.dto.RegisterResponse;
import com.tpo.backend.auth.dto.SetContraseniaRequest;
import com.tpo.backend.email.EmailService;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.common.exception.BadRequestException;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.direccion.entity.DireccionEntity;
import com.tpo.backend.direccion.repository.DireccionRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.Optional;

@Service
public class AuthService {

    private static final Long VERIFICADOR_SISTEMA_ID = 2L;

    private final UsuarioRepository usuarioRepository;
    private final PersonaRepository personaRepository;
    private final ClienteRepository clienteRepository;
    private final DireccionRepository direccionRepository;
    private final EmailService emailService;

    public AuthService(UsuarioRepository usuarioRepository,
                       PersonaRepository personaRepository,
                       ClienteRepository clienteRepository,
                       DireccionRepository direccionRepository,
                       EmailService emailService) {
        this.usuarioRepository = usuarioRepository;
        this.personaRepository = personaRepository;
        this.clienteRepository = clienteRepository;
        this.direccionRepository = direccionRepository;
        this.emailService = emailService;
    }

    @Transactional
    public RegisterResponse register(RegisterRequest request) {
        String email = request.getEmail().trim().toLowerCase();
        String documento = request.getDocumento().trim();

        if (usuarioRepository.existsByEmail(email)) {
            throw new ConflictException("El usuario ya completo su registro.");
        }

        if (personaRepository.existsByDocumento(documento)) {
            throw new ConflictException("Ya existe una persona registrada con ese documento.");
        }

        PersonaEntity persona = new PersonaEntity();
        persona.setNombre(request.getNombre().trim());
        persona.setApellido(request.getApellido().trim());
        persona.setDocumento(documento);
        persona.setEstado("pendiente");
        persona.setPaisOrigen(request.getNumeroPais());

        try {
            persona.setFotoDniFrente(request.getDniFrente().getBytes());
            persona.setFotoDniDorso(request.getDniDorso().getBytes());
        } catch (IOException e) {
            throw new BadRequestException("Error al procesar las fotos del DNI.");
        }

        persona = personaRepository.save(persona);

        
        UsuarioEntity usuario = new UsuarioEntity();
        usuario.setEmail(email);
        usuario.setPersonaId(persona.getId());
        usuario.setActivo(false);
        usuario.setUltimoAcceso(OffsetDateTime.now());
        usuario = usuarioRepository.save(usuario);
        
        ClienteEntity cliente = new ClienteEntity();
        cliente.setId(persona.getId());
        cliente.setNumeroPais(request.getNumeroPais());
        cliente.setAdmitido(false);
        cliente.setCategoria(null);
        cliente.setVerificador(VERIFICADOR_SISTEMA_ID);
        clienteRepository.save(cliente);
        
        DireccionEntity domicilio = new DireccionEntity();
        domicilio.setPersona(persona.getId());
        domicilio.setNombre("Domicilio legal");
        domicilio.setCalle(request.getCalle());
        domicilio.setNumero(request.getNumeroCalle());
        domicilio.setPiso(request.getPiso());
        domicilio.setDepartamento(request.getDepartamento());
        domicilio.setCiudad(request.getCiudad());
        domicilio.setProvincia(request.getProvincia());
        domicilio.setCodigoPostal(request.getCodigoPostal());
        domicilio.setPais(request.getNumeroPais());
        domicilio.setFavorito(true);
        direccionRepository.save(domicilio);

        System.out.println(
                "Nuevo cliente pendiente de validacion: " +
                        persona.getNombre() +
                        " | DNI: " + documento +
                        " | Email: " + email +
                        " | ClienteId: " + cliente.getId()
        );

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

        if (usuario.getPasswordHash() == null
                || !usuario.getPasswordHash().equals(request.getContrasenia())) {
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

        UsuarioEntity usuario = usuarioRepository.findByEmail(request.getEmail().trim().toLowerCase())
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado con email: " + request.getEmail()));

        if (usuario.getPasswordHash() != null) {
            if (request.getContraseniaActual() == null || request.getContraseniaActual().isBlank()) {
                throw new BadRequestException("Debe ingresar la contrasenia actual.");
            }
            if (!usuario.getPasswordHash().equals(request.getContraseniaActual())) {
                throw new UnauthorizedException("La contrasenia actual es incorrecta.");
            }
        }

        usuario.setPasswordHash(request.getContrasenia());
        usuarioRepository.save(usuario);

        emailService.enviarCambioClave(usuario.getEmail());
    }
}
