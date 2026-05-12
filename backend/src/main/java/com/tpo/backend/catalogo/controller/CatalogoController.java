package com.tpo.backend.catalogo.controller;

import com.tpo.backend.catalogo.dto.CatalogoListDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoDetailDto;
import com.tpo.backend.catalogo.dto.ItemCatalogoNewRequest;
import com.tpo.backend.catalogo.service.CatalogoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class CatalogoController {

    private final CatalogoService catalogoService;

    public CatalogoController(CatalogoService catalogoService) {
        this.catalogoService = catalogoService;
    }

    @GetMapping("/catalogos")
    public ResponseEntity<List<CatalogoListDto>> listar() {
        return ResponseEntity.ok(catalogoService.listarTodos());
    }

    @GetMapping("/catalogos/{catalogoId}/items/{itemId}")
    public ResponseEntity<ItemCatalogoDetailDto> getItem(@PathVariable Long catalogoId,
                                                          @PathVariable Long itemId) {
        return ResponseEntity.ok(catalogoService.getItemDetalle(catalogoId, itemId));
    }

    @GetMapping("/subastas/{subastaId}/catalogos/{catalogoId}/items")
    public ResponseEntity<List<CatalogoListDto.ItemDto>> getItemsByCatalogo(@PathVariable Long subastaId,
                                                                              @PathVariable Long catalogoId) {
        return ResponseEntity.ok(catalogoService.getItemsByCatalogo(subastaId, catalogoId));
    }

    @PostMapping("/item-catalogo")
    public ResponseEntity<ItemCatalogoDetailDto> crearItem(@Valid @RequestBody ItemCatalogoNewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(catalogoService.crearItem(request));
    }

    @GetMapping("/item-catalogo/{userId}")
    public ResponseEntity<List<ItemCatalogoDetailDto>> getByDuenio(@PathVariable Long userId) {
        return ResponseEntity.ok(catalogoService.getItemsByDuenio(userId));
    }
}
