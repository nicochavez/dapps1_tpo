package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.AprobarClienteRequest;
import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class AdminClienteService {

    private final ClienteRepository clienteRepository;
    private final PersonaRepository personaRepository;
    private final ClienteService clienteService;

    public AdminClienteService(ClienteRepository clienteRepository,
                               PersonaRepository personaRepository,
                               ClienteService clienteService) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
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
        persona.setEstado("activo");
        personaRepository.save(persona);

        return clienteService.toDto(cliente);
    }

    @Transactional
    public ClienteDto rechazar(Long clienteId) {
        ClienteEntity cliente = clienteRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado: " + clienteId));

        cliente.setAdmitido(false);
        cliente.setCategoria("rechazado");
        cliente = clienteRepository.save(cliente);

        PersonaEntity persona = personaRepository.findById(clienteId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + clienteId));
        persona.setEstado("rechazado");
        personaRepository.save(persona);

        return clienteService.toDto(cliente);
    }
}