package com.tpo.backend.producto.controller;

import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.dto.ProductoNewRequest;
import com.tpo.backend.producto.dto.ProductoUpdateRequest;
import com.tpo.backend.producto.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/productos")
public class ProductoController {

    private final ProductoService productoService;

    public ProductoController(ProductoService productoService) {
        this.productoService = productoService;
    }

    @GetMapping
    public ResponseEntity<List<ProductoDto>> listar(
            @RequestParam(required = false) Boolean disponible,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        return ResponseEntity.ok(productoService.listar(disponible, page, size));
    }

    @GetMapping("/{productoId}")
    public ResponseEntity<ProductoDto> getById(@PathVariable Long productoId) {
        return ResponseEntity.ok(productoService.getById(productoId));
    }

    @PutMapping("/{productoId}")
    public ResponseEntity<ProductoDto> actualizar(@PathVariable Long productoId,
                                                   @RequestBody ProductoUpdateRequest request) {
        return ResponseEntity.ok(productoService.actualizar(productoId, request));
    }

    @GetMapping("/{productoId}/fotos/{fotoId}")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long productoId, @PathVariable Long fotoId) {
        productoService.getFoto(productoId, fotoId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/{duenioId}/addProducto")
    public ResponseEntity<ProductoDto> crear(@PathVariable Long duenioId,
                                              @Valid @RequestBody ProductoNewRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(duenioId, request));
    }
}
