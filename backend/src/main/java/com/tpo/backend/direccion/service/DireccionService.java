package com.tpo.backend.direccion.service;

import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.direccion.dto.DireccionDto;
import com.tpo.backend.direccion.dto.DireccionRequest;
import com.tpo.backend.direccion.entity.DireccionEntity;
import com.tpo.backend.direccion.repository.DireccionRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class DireccionService {

    private final DireccionRepository direccionRepository;

    public DireccionService(DireccionRepository direccionRepository) {
        this.direccionRepository = direccionRepository;
    }

    @Transactional
    public List<DireccionDto> listar(Long personaId) {
        return direccionRepository.findByPersona(personaId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public DireccionDto crear(Long personaId, DireccionRequest request) {
        DireccionEntity dir = new DireccionEntity();
        dir.setPersona(personaId);
        applyRequest(dir, request);
        dir = direccionRepository.save(dir);
        return toDto(dir);
    }

    @Transactional
    public DireccionDto getFavorita(Long personaId) {
        DireccionEntity dir = direccionRepository.findByPersonaAndFavoritoTrue(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("No hay direccion favorita para la persona: " + personaId));
        return toDto(dir);
    }

    @Transactional
    public DireccionDto actualizar(Long personaId, Long direccionId, DireccionRequest request) {
        DireccionEntity dir = direccionRepository.findById(direccionId)
                .filter(d -> d.getPersona().equals(personaId))
                .orElseThrow(() -> new ResourceNotFoundException("Direccion no encontrada: " + direccionId));
        applyRequest(dir, request);
        direccionRepository.save(dir);
        return toDto(dir);
    }

    @Transactional
    public void eliminar(Long personaId, Long direccionId) {
        DireccionEntity dir = direccionRepository.findById(direccionId)
                .filter(d -> d.getPersona().equals(personaId))
                .orElseThrow(() -> new ResourceNotFoundException("Direccion no encontrada: " + direccionId));
        direccionRepository.delete(dir);
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
        dir.setPais(request.getPais());
        dir.setFavorito(request.isFavorito());
    }

    private DireccionDto toDto(DireccionEntity d) {
        return new DireccionDto(
                d.getId(), d.getNombre(), d.getCalle(), d.getNumero(),
                d.getPiso(), d.getDepartamento(), d.getCiudad(),
                d.getProvincia(), d.getCodigoPostal(), d.getPais(),
                Boolean.TRUE.equals(d.getFavorito())
        );
    }
}
