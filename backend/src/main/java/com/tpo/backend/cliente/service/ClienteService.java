package com.tpo.backend.cliente.service;

import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.dto.ClienteUpdateRequest;
import com.tpo.backend.cliente.dto.MetricasDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.common.dto.PaisDto;
import com.tpo.backend.common.entity.PaisEntity;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.repository.PaisRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
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

    public ClienteService(ClienteRepository clienteRepository,
                          PersonaRepository personaRepository,
                          PaisRepository paisRepository,
                          AsistenteRepository asistenteRepository,
                          RegistroDeSubastaRepository registroRepository) {
        this.clienteRepository = clienteRepository;
        this.personaRepository = personaRepository;
        this.paisRepository = paisRepository;
        this.asistenteRepository = asistenteRepository;
        this.registroRepository = registroRepository;
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
        int subastasAsistidas = asistenteRepository.findByCliente(cliente.getId()).size();
        var registros = registroRepository.findByCliente(cliente.getId());
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
        return clienteRepository.findAll().stream()
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("No hay clientes registrados."));
    }

    public ClienteDto toDto(ClienteEntity cliente) {
        PersonaEntity persona = personaRepository.findById(cliente.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + cliente.getId()));
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
                persona.getEstado(),
                cliente.getCategoria(),
                Boolean.TRUE.equals(cliente.getAdmitido()),
                paisDto
        );
    }
}
