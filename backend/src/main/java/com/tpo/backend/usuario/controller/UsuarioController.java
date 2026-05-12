package com.tpo.backend.usuario.controller;

import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.cliente.repository.ClienteRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepository;
    private final ClienteRepository clienteRepository;
    private final ClienteService clienteService;

    public UsuarioController(UsuarioRepository usuarioRepository,
                             ClienteRepository clienteRepository,
                             ClienteService clienteService) {
        this.usuarioRepository = usuarioRepository;
        this.clienteRepository = clienteRepository;
        this.clienteService = clienteService;
    }

    @GetMapping("/{userId}")
    public ResponseEntity<ClienteDto> getById(@PathVariable Long userId) {
        ClienteEntity cliente = clienteRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + userId));
        return ResponseEntity.ok(clienteService.toDto(cliente));
    }

    @GetMapping("/mail/{mail}")
    public ResponseEntity<ClienteDto> getByEmail(@PathVariable String mail) {
        UsuarioEntity usuario = usuarioRepository.findByEmail(mail)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado: " + mail));
        if (usuario.getPersonaId() == null) {
            throw new ResourceNotFoundException("Usuario sin persona asociada: " + mail);
        }
        ClienteEntity cliente = clienteRepository.findById(usuario.getPersonaId())
                .orElseThrow(() -> new ResourceNotFoundException("Cliente no encontrado para usuario: " + mail));
        return ResponseEntity.ok(clienteService.toDto(cliente));
    }
}
