package com.tpo.backend.pais.controller;

import com.tpo.backend.common.dto.PaisDto;
import com.tpo.backend.common.entity.PaisEntity;
import com.tpo.backend.common.repository.PaisRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/v1/paises")
public class PaisController {

    private final PaisRepository paisRepository;

    public PaisController(PaisRepository paisRepository) {
        this.paisRepository = paisRepository;
    }

    @GetMapping
    public ResponseEntity<List<PaisDto>> listar() {
        List<PaisDto> paises = paisRepository.findAll().stream()
                .map(this::toDto)
                .toList();
        return ResponseEntity.ok(paises);
    }

    private PaisDto toDto(PaisEntity p) {
        return new PaisDto(p.getNumero(), p.getNombre(), p.getNombreCorto(), p.getNacionalidad());
    }
}
