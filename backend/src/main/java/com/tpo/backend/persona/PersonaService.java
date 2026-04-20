package com.tpo.backend.persona;

import org.springframework.stereotype.Service;

import java.util.Base64;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class PersonaService {

    private final PersonaRepository personaRepository;

    public PersonaService(PersonaRepository personaRepository) {
        this.personaRepository = personaRepository;
    }

    // CREATE
    public PersonaDTO createPersona(PersonaDTO dto) {
        if (personaRepository.existsByDocumento(dto.getDocumento())) {
            throw new RuntimeException("A persona with this document already exists.");
        }

        PersonaEntity entity = new PersonaEntity();
        mapDtoToEntity(dto, entity);
        
        PersonaEntity savedEntity = personaRepository.save(entity);
        return mapEntityToDto(savedEntity);
    }

    // READ ALL
    public List<PersonaDTO> getAllPersonas() {
        return personaRepository.findAll().stream()
                .map(this::mapEntityToDto)
                .collect(Collectors.toList());
    }

    // READ ONE
    public PersonaDTO getPersonaById(Long id) {
        PersonaEntity entity = personaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persona not found with ID: " + id));
        return mapEntityToDto(entity);
    }

    // UPDATE
    public PersonaDTO updatePersona(Long id, PersonaDTO dto) {
        PersonaEntity existingEntity = personaRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Persona not found with ID: " + id));

        mapDtoToEntity(dto, existingEntity);
        
        PersonaEntity updatedEntity = personaRepository.save(existingEntity);
        return mapEntityToDto(updatedEntity);
    }

    // DELETE
    public void deletePersona(Long id) {
        if (!personaRepository.existsById(id)) {
            throw new RuntimeException("Persona not found with ID: " + id);
        }
        personaRepository.deleteById(id);
    }

    // --- Helper Mapping Methods ---

    private void mapDtoToEntity(PersonaDTO dto, PersonaEntity entity) {
        entity.setDocumento(dto.getDocumento());
        entity.setNombre(dto.getNombre());
        entity.setDireccion(dto.getDireccion());
        entity.setEstado(dto.getEstado());

        // Convert Base64 string back to byte[] for database storage
        if (dto.getFotoBase64() != null && !dto.getFotoBase64().isEmpty()) {
            byte[] decodedBytes = Base64.getDecoder().decode(dto.getFotoBase64());
            entity.setFoto(decodedBytes);
        }
    }

    private PersonaDTO mapEntityToDto(PersonaEntity entity) {
        PersonaDTO dto = new PersonaDTO();
        dto.setId(entity.getId());
        dto.setDocumento(entity.getDocumento());
        dto.setNombre(entity.getNombre());
        dto.setDireccion(entity.getDireccion());
        dto.setEstado(entity.getEstado());

        // Convert byte[] from database back to Base64 string for JSON response
        if (entity.getFoto() != null) {
            String encodedString = Base64.getEncoder().encodeToString(entity.getFoto());
            dto.setFotoBase64(encodedString);
        }
        return dto;
    }
}