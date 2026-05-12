package com.tpo.backend.subasta.controller;

import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.dto.CatalogoListDto;
import com.tpo.backend.catalogo.service.CatalogoService;
import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.subasta.dto.*;
import com.tpo.backend.subasta.service.SubastaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/subastas")
public class SubastaController {

    private final SubastaService subastaService;
    private final CatalogoService catalogoService;

    public SubastaController(SubastaService subastaService, CatalogoService catalogoService) {
        this.subastaService = subastaService;
        this.catalogoService = catalogoService;
    }

    @GetMapping
    public ResponseEntity<PagedResponse<SubastaListItemDto>> listar(
            @RequestParam(required = false) String estado,
            @RequestParam(required = false) String categoria,
            @RequestParam(required = false) String fecha,
            @RequestParam(required = false) String moneda,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(subastaService.listar(estado, categoria, fecha, moneda, page, size));
    }

    @PostMapping
    public ResponseEntity<SubastaDetailDto> crear(@Valid @RequestBody SubastaNewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subastaService.crear(request));
    }

    @GetMapping("/{subastaId}")
    public ResponseEntity<SubastaDetailDto> getById(@PathVariable Long subastaId) {
        return ResponseEntity.ok(subastaService.getById(subastaId));
    }

    @PutMapping("/{subastaId}")
    public ResponseEntity<Void> actualizar(@PathVariable Long subastaId,
                                            @RequestBody SubastaUpdateRequest request) {
        subastaService.actualizar(subastaId, request);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/{subastaId}/conectar")
    public ResponseEntity<ConectarResponse> conectar(@PathVariable Long subastaId) {
        return ResponseEntity.ok(subastaService.conectar(subastaId));
    }

    @PostMapping("/{subastaId}/desconectar")
    public ResponseEntity<Void> desconectar(@PathVariable Long subastaId) {
        subastaService.desconectar(subastaId);
        return ResponseEntity.ok().build();
    }

    @GetMapping("/{subastaId}/item-actual")
    public ResponseEntity<ItemActualDto> getItemActual(@PathVariable Long subastaId) {
        return ResponseEntity.ok(subastaService.getItemActual(subastaId));
    }

    @GetMapping("/{subastaId}/catalogos")
    public ResponseEntity<List<CatalogoListDto>> getCatalogos(@PathVariable Long subastaId) {
        return ResponseEntity.ok(catalogoService.getCatalogosForSubasta(subastaId));
    }

    @PostMapping("/{subastaId}/addItem")
    public ResponseEntity<ItemCatalogoDetailDto> addItem(@PathVariable Long subastaId,
                                                          @Valid @RequestBody ItemCatalogoNewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(subastaService.addItem(subastaId, request));
    }

    @DeleteMapping("/{subastaId}/removeItem/{itemId}")
    public ResponseEntity<Void> removeItem(@PathVariable Long subastaId, @PathVariable Long itemId) {
        subastaService.removeItem(subastaId, itemId);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/duenios/{userId}")
    public ResponseEntity<List<SubastaListItemDto>> getByDuenio(@PathVariable Long userId) {
        return ResponseEntity.ok(subastaService.getByDuenio(userId));
    }

    @GetMapping("/cliente/{userId}")
    public ResponseEntity<List<SubastaListItemDto>> getByCliente(@PathVariable Long userId) {
        return ResponseEntity.ok(subastaService.getByCliente(userId));
    }
}
