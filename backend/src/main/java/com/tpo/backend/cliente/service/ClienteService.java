package com.tpo.backend.cliente.service;

import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.dto.ClienteUpdateRequest;
import com.tpo.backend.cliente.dto.MetricasDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.common.dto.PaisDto;
import com.tpo.backend.common.entity.PaisEntity;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import com.tpo.backend.common.repository.PaisRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import com.tpo.backend.auth.security.SecurityUtils;
import com.tpo.backend.subasta.repository.AsistenteRepository;
import com.tpo.backend.subasta.repository.RegistroDeSubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.HashMap;
import java.util.Map;

@Service
public class ClienteService {

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final PaisRepository paisRepository;
    private final AsistenteRepository asistenteRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final UsuarioRepository usuarioRepository;

    public ClienteService(ClienteRepository clienteRepository,
                          PersonaRepository personaRepository,
                          PaisRepository paisRepository,
                          AsistenteRepository asistenteRepository,
                          RegistroDeSubastaRepository registroRepository,
                          UsuarioRepository usuarioRepository) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.paisRepository = paisRepository;
        this.asistenteRepository = asistenteRepository;
        this.registroRepository = registroRepository;
        this.usuarioRepository = usuarioRepository;
    }

    @Transactional
    public ClienteDto getAuthenticatedCliente() {
        ClienteEntity cliente = currentClienteEntity();
        return toDto(cliente);
    }

    @Transactional
    public ClienteDto updateCliente(ClienteUpdateRequest request) {
        ClienteEntity cliente = currentClienteEntity();
        return toDto(cliente);
    }

    @Transactional
    public MetricasDto getMetricas() {
        ClienteEntity cliente = currentClienteEntity();

        int subastasAsistidas = asistenteRepository.findByClienteId(cliente.getId()).size();

        var registros = registroRepository.findByClienteId(cliente.getId());
        int subastasGanadas = registros.size();

        BigDecimal totalPagado = registros.stream()
                .map(r -> r.getImporte().add(r.getComision()))
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        Map<String, Integer> participaciones = new HashMap<>();
        participaciones.put("comun", 0);
        participaciones.put("especial", 0);
        participaciones.put("plata", 0);
        participaciones.put("oro", 0);
        participaciones.put("platino", 0);

        return new MetricasDto(subastasAsistidas, subastasGanadas, totalPagado, totalPagado, participaciones);
    }

    public ClienteEntity currentClienteEntity() {
        Long personaId = SecurityUtils.currentPersonaId();

        return clienteRepository.findById(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado para la persona: " + personaId));
    }

    /** Cliente autenticado o {@code null} si no hay token valido (para endpoints publicos). */
    public ClienteEntity currentClienteOrNull() {
        var user = SecurityUtils.currentUserOrNull();
        if (user == null) {
            return null;
        }
        return clienteRepository.findById(user.personaId()).orElse(null);
    }

    /** true si el request trae un token que mapea a un cliente registrado (RF-13). */
    public boolean isAuthenticated() {
        return currentClienteOrNull() != null;
    }

    public ClienteDto toDto(ClienteEntity cliente) {
        PersonaEntity persona = personaRepository.findById(cliente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + cliente.getId()));

        String email = usuarioRepository.findByPersonaId(cliente.getId())
                .map(u -> u.getEmail())
                .orElse(null);

        PaisDto paisDto = null;
        if (cliente.getNumeroPais() != null) {
            PaisEntity pais = paisRepository.findById(cliente.getNumeroPais()).orElse(null);
            if (pais != null) {
                paisDto = new PaisDto(pais.getNumero(), pais.getNombre(), pais.getNombreCorto(), pais.getNacionalidad());
            }
        }

        return new ClienteDto(
                cliente.getId(),
                persona.getDocumento(),
                persona.getNombre(),
                email,
                persona.getEstado(),
                cliente.getCategoria(),
                Boolean.TRUE.equals(cliente.getAdmitido()),
                paisDto
        );
    }
}