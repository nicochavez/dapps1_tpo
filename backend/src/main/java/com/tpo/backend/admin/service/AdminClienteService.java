package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.AprobarClienteRequest;
import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.notificacion.entity.NotificacionEntity;
import com.tpo.backend.notificacion.repository.NotificacionRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.OffsetDateTime;
import java.util.List;

@Service
public class AdminClienteService {

    private static final Logger log = LoggerFactory.getLogger(AdminClienteService.class);

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final NotificacionRepository notificacionRepository;
    private final ClienteService clienteService;

    public AdminClienteService(ClienteRepository clienteRepository,
                               PersonaRepository personaRepository,
                               NotificacionRepository notificacionRepository,
                               ClienteService clienteService) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.notificacionRepository = notificacionRepository;
        this.clienteService = clienteService;
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
        persona.setEstado("aprobado"); // estado_registro: pendiente | aprobado | rechazado
        personaRepository.save(persona);

        // RF-04: invitacion a completar el registro y generar la clave personal.
        // Sin SMTP en el MVP: se registra en log y como notificacion persistida.
        notificarAprobacion(cliente, persona);

        return clienteService.toDto(cliente);
    }

    /** Mock de envio de mail (RF-04): log + NotificacionEntity. */
    private void notificarAprobacion(ClienteEntity cliente, PersonaEntity persona) {
        log.info("[MAIL][MOCK] Cliente {} (documento {}) aprobado en categoria {}. " +
                        "Invitacion a generar clave personal (POST /api/v1/auth/set-contrasenia).",
                cliente.getId(), persona.getDocumento(), cliente.getCategoria());

        NotificacionEntity notificacion = new NotificacionEntity();
        notificacion.setCliente(cliente.getId());
        notificacion.setTitulo("Registro aprobado");
        notificacion.setMensaje("Tu registro fue aprobado en la categoria " + cliente.getCategoria() +
                ". Genera tu clave personal para comenzar a operar.");
        notificacion.setLeida(false);
        notificacion.setFechaCreacion(OffsetDateTime.now());
        notificacionRepository.save(notificacion);
    }

    @Transactional
    public ClienteDto rechazar(Long clienteId) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + clienteId));

        cliente.setAdmitido(false);
        // categoria solo admite comun|especial|plata|oro|platino; el rechazo se refleja en estado_registro.
        cliente.setCategoria(null);
        cliente = clienteRepository.save(cliente);

        PersonaEntity persona = personaRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + clienteId));
        persona.setEstado("rechazado");
        personaRepository.save(persona);

        return clienteService.toDto(cliente);
    }
}