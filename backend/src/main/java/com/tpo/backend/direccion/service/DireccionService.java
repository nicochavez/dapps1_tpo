package com.tpo.backend.direccion.service;

import com.tpo.backend.common.entity.PaisEntity;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.repository.PaisRepository;
import com.tpo.backend.direccion.dto.DireccionDto;
import com.tpo.backend.direccion.dto.DireccionRequest;
import com.tpo.backend.direccion.entity.DireccionEntity;
import com.tpo.backend.direccion.repository.DireccionRepository;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.persona.PersonaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;
    private final PersonaRepository personaRepository;
    private final PaisRepository paisRepository;

    public DireccionService(DireccionRepository direccionRepository,
                            PersonaRepository personaRepository,
                            PaisRepository paisRepository) {
        this.direccionRepository = direccionRepository;
        this.personaRepository = personaRepository;
        this.paisRepository = paisRepository;
    }

    @Transactional
    public List<DireccionDto> listar(Long personaId) {
        return direccionRepository.findByPersonaId(personaId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DireccionDto crear(Long personaId, DireccionRequest request) {
        if (request.isFavorito()) {
            clearFavorito(personaId, null);
        }
        PersonaEntity persona = personaRepository.findById(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("Persona no encontrada: " + personaId));
        DireccionEntity dir = new DireccionEntity();
        dir.setPersona(persona);
        applyRequest(dir, request);
        dir = direccionRepository.save(dir);
        return toDto(dir);
    }

    @Transactional
    public DireccionDto getFavorita(Long personaId) {
        DireccionEntity dir = direccionRepository.findByPersonaIdAndFavoritoTrue(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay direccion favorita para la persona: " + personaId));
        return toDto(dir);
    }

    @Transactional
    public DireccionDto actualizar(Long personaId, Long direccionId, DireccionRequest request) {
        DireccionEntity dir = direccionRepository.findById(direccionId)
                .filter(d -> d.getPersona().getId().equals(personaId))
                .orElseThrow(() -> new ResourceNotFoundException("Direccion no encontrada: " + direccionId));
        if (request.isFavorito()) {
            clearFavorito(personaId, direccionId);
        }
        applyRequest(dir, request);
        direccionRepository.save(dir);
        return toDto(dir);
    }

    @Transactional
    public void eliminar(Long personaId, Long direccionId) {
        DireccionEntity dir = direccionRepository.findById(direccionId)
                .filter(d -> d.getPersona().getId().equals(personaId))
                .orElseThrow(() -> new ResourceNotFoundException("Direccion no encontrada: " + direccionId));
        direccionRepository.delete(dir);
    }

    private void clearFavorito(Long personaId, Long excludeId) {
        direccionRepository.findByPersonaIdAndFavoritoTrue(personaId).ifPresent(existing -> {
            if (!existing.getId().equals(excludeId)) {
                existing.setFavorito(false);
                direccionRepository.save(existing);
            }
        });
    }

    private void applyRequest(DireccionEntity dir, DireccionRequest request) {
        dir.setNombre(request.getNombre());
        dir.setCalle(request.getCalle());
        dir.setNumero(request.getNumero());
        dir.setPiso(request.getPiso());
        dir.setDepartamento(request.getDepartamento());
        dir.setCiudad(request.getCiudad());
        dir.setProvincia(request.getProvincia());
        dir.setCodigoPostal(request.getCodigoPostal());
        if (request.getPais() != null) {
            PaisEntity pais = paisRepository.findById(request.getPais())
                    .orElseThrow(() -> new ResourceNotFoundException("Pais no encontrado: " + request.getPais()));
            dir.setPais(pais);
        } else {
            dir.setPais(null);
        }
        dir.setFavorito(request.isFavorito());
    }

    private DireccionDto toDto(DireccionEntity d) {
        return new DireccionDto(
                d.getId(), d.getNombre(), d.getCalle(), d.getNumero(),
                d.getPiso(), d.getDepartamento(), d.getCiudad(),
                d.getProvincia(), d.getCodigoPostal(),
                d.getPais() != null ? d.getPais().getNumero() : null,
                Boolean.TRUE.equals(d.getFavorito())
        );
    }
}
