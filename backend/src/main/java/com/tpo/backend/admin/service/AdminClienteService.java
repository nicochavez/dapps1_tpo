package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.AprobarClienteRequest;
import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.email.EmailService;
import com.tpo.backend.notificacion.entity.NotificacionEntity;
import com.tpo.backend.notificacion.repository.NotificacionRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.SecureRandom;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AdminClienteService {

    private static final Logger log = LoggerFactory.getLogger(AdminClienteService.class);
    private static final String CHARS = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789";
    private static final SecureRandom RNG = new SecureRandom();

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final UsuarioRepository usuarioRepository;
    private final NotificacionRepository notificacionRepository;
    private final ClienteService clienteService;
    private final EmailService emailService;
    private final PasswordEncoder passwordEncoder;

    public AdminClienteService(ClienteRepository clienteRepository,
                               PersonaRepository personaRepository,
                               UsuarioRepository usuarioRepository,
                               NotificacionRepository notificacionRepository,
                               ClienteService clienteService,
                               EmailService emailService,
                               PasswordEncoder passwordEncoder) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.usuarioRepository = usuarioRepository;
        this.notificacionRepository = notificacionRepository;
        this.clienteService = clienteService;
        this.emailService = emailService;
        this.passwordEncoder = passwordEncoder;
    }

    @Transactional
    public List<ClienteDto> listarPendientes() {
        return clienteRepository.findByAdmitidoFalse()
                .stream()
                .map(clienteService::toDto)
                .toList();
    }

    @Transactional
    public ClienteDto aprobar(Long clienteId, AprobarClienteRequest request) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + clienteId));

        cliente.setAdmitido(true);
        cliente.setCategoria(request.getCategoria() != null ? request.getCategoria() : "comun");
        cliente = clienteRepository.save(cliente);

        PersonaEntity persona = personaRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + clienteId));
        persona.setEstado("aprobado");
        personaRepository.save(persona);

        UsuarioEntity usuario = usuarioRepository.findByPersonaId(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para persona: " + clienteId));

        String contraseniaTemporal = generarContrasenia(10);
        usuario.setPasswordHash(passwordEncoder.encode(contraseniaTemporal));
        usuario.setActivo(true);
        usuarioRepository.save(usuario);

        notificarAprobacion(cliente, persona, usuario.getEmail(), contraseniaTemporal);

        return clienteService.toDto(cliente);
    }

    private void notificarAprobacion(ClienteEntity cliente, PersonaEntity persona,
                                     String email, String contraseniaTemporal) {
        emailService.enviarAprobacion(email, persona.getNombre(), contraseniaTemporal);

        NotificacionEntity notificacion = new NotificacionEntity();
        notificacion.setCliente(cliente);
        notificacion.setTitulo("Registro aprobado");
        notificacion.setMensaje("Tu registro fue aprobado en la categoria " + cliente.getCategoria() +
                ". Revisá tu email para obtener tu contraseña temporal.");
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(OffsetDateTime.now());
        notificacionRepository.save(notificacion);
    }

    @Transactional
    public ClienteDto rechazar(Long clienteId) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + clienteId));

        cliente.setAdmitido(false);
        cliente.setCategoria(null);
        cliente = clienteRepository.save(cliente);

        PersonaEntity persona = personaRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + clienteId));
        persona.setEstado("rechazado");
        personaRepository.save(persona);

        return clienteService.toDto(cliente);
    }

    private String generarContrasenia(int longitud) {
        StringBuilder sb = new StringBuilder(longitud);
        for (int i = 0; i < longitud; i++) {
            sb.append(CHARS.charAt(RNG.nextInt(CHARS.length())));
        }
        return sb.toString();
    }
}
