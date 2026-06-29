package com.tpo.backend.notificacion.service;

import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.notificacion.dto.NotificacionDto;
import com.tpo.backend.notificacion.entity.NotificacionEntity;
import com.tpo.backend.notificacion.repository.NotificacionRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.servlet.mvc.method.annotation.SseEmitter;

import java.io.IOException;
import java.time.OffsetDateTime;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.CopyOnWriteArrayList;

/**
 * Servicio central de notificaciones. El resto de los modulos lo inyectan y
 * llaman {@link #enviar(Long, String, String)} para avisar a un cliente; la
 * notificacion se persiste y, si el cliente tiene una conexion SSE abierta, se
 * le entrega en tiempo real.
 */
@Service
public class NotificacionService {

    private static final Logger log = LoggerFactory.getLogger(NotificacionService.class);

    /** 30 minutos: pasado ese tiempo el cliente debe reconectar el stream. */
    private static final long SSE_TIMEOUT_MS = 30L * 60 * 1000;

    private final NotificacionRepository notificacionRepository;
    private final ClienteRepository clienteRepository;

    /** Emitters SSE activos por cliente. Un cliente puede tener varios (varios dispositivos). */
    private final Map<Long, List<SseEmitter>> emitters = new ConcurrentHashMap<>();

    public NotificacionService(NotificacionRepository notificacionRepository,
                               ClienteRepository clienteRepository) {
        this.notificacionRepository = notificacionRepository;
        this.clienteRepository = clienteRepository;
    }

    // --- Suscripcion SSE ---------------------------------------------------

    /** Registra una conexion SSE para el cliente y devuelve el emitter al controller. */
    public SseEmitter subscribe(Long clienteId) {
        SseEmitter emitter = new SseEmitter(SSE_TIMEOUT_MS);

        emitters.computeIfAbsent(clienteId, k -> new CopyOnWriteArrayList<>()).add(emitter);

        emitter.onCompletion(() -> remove(clienteId, emitter));
        emitter.onTimeout(() -> {
            remove(clienteId, emitter);
            emitter.complete();
        });
        emitter.onError(e -> remove(clienteId, emitter));

        // Evento inicial para confirmar la apertura del stream.
        try {
            emitter.send(SseEmitter.event().name("conectado").data("ok"));
        } catch (IOException e) {
            remove(clienteId, emitter);
        }

        log.debug("Cliente {} suscrito a notificaciones SSE ({} conexiones activas)",
                clienteId, emitters.getOrDefault(clienteId, List.of()).size());
        return emitter;
    }

    // --- API para el resto de los modulos ----------------------------------

    /**
     * Crea una notificacion para el cliente, la persiste y la entrega por SSE
     * si esta conectado. Punto de entrada para los demas modulos.
     */
    @Transactional
    public NotificacionDto enviar(Long clienteId, String titulo, String mensaje) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + clienteId));

        NotificacionEntity entity = new NotificacionEntity();
        entity.setCliente(cliente);
        entity.setTitulo(titulo);
        entity.setMensaje(mensaje);
        entity.setLeida(false);
        entity.setFechaCreacion(OffsetDateTime.now());
        notificacionRepository.save(entity);

        NotificacionDto dto = toDto(entity);
        push(clienteId, dto);
        return dto;
    }

    // --- Lectura -----------------------------------------------------------

    @Transactional(readOnly = true)
    public List<NotificacionDto> listar(Long clienteId) {
        return notificacionRepository.findByClienteIdOrderByFechaCreacionDesc(clienteId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public NotificacionDto marcarLeida(Long clienteId, Long notificacionId) {
        NotificacionEntity entity = notificacionRepository
                .findByIdAndClienteId(notificacionId, clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Notificacion no encontrada: " + notificacionId));
        entity.setLeida(true);
        notificacionRepository.save(entity);
        return toDto(entity);
    }

    // --- Internos ----------------------------------------------------------

    private void push(Long clienteId, NotificacionDto dto) {
        List<SseEmitter> clienteEmitters = emitters.get(clienteId);
        if (clienteEmitters == null || clienteEmitters.isEmpty()) {
            return;
        }
        for (SseEmitter emitter : clienteEmitters) {
            try {
                emitter.send(SseEmitter.event().name("notificacion").data(dto));
            } catch (IOException | IllegalStateException e) {
                // Conexion caida: la descartamos y seguimos con las demas.
                remove(clienteId, emitter);
            }
        }
    }

    private void remove(Long clienteId, SseEmitter emitter) {
        List<SseEmitter> clienteEmitters = emitters.get(clienteId);
        if (clienteEmitters != null) {
            clienteEmitters.remove(emitter);
            if (clienteEmitters.isEmpty()) {
                emitters.remove(clienteId);
            }
        }
    }

    private NotificacionDto toDto(NotificacionEntity n) {
        return new NotificacionDto(
                n.getId(),
                n.getTitulo(),
                n.getMensaje(),
                Boolean.TRUE.equals(n.getLeida()),
                n.getFechaCreacion() != null ? n.getFechaCreacion().toString() : null
        );
    }
}
