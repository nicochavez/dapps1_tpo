package com.tpo.backend.producto.controller;

import com.tpo.backend.auth.security.AuthenticatedUser;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.dto.ProductoNewRequest;
import com.tpo.backend.producto.dto.ProductoUpdateRequest;
import com.tpo.backend.producto.service.ProductoService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

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

    @GetMapping("/me")
    public ResponseEntity<List<ProductoDto>> listarMios(@AuthenticationPrincipal AuthenticatedUser me) {
        return ResponseEntity.ok(productoService.listarPorDuenio(me.personaId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDto> crear(@AuthenticationPrincipal AuthenticatedUser me,
                                             @Valid @RequestPart("data") ProductoNewRequest request,
                                             @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos) {
        return ResponseEntity.status(HttpStatus.CREATED).body(productoService.crear(me.personaId(), request, fotos));
    }

    @PutMapping(value = "/{productoId}", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDto> actualizar(@PathVariable Long productoId,
                                                  @RequestPart("data") ProductoUpdateRequest request,
                                                  @RequestPart(value = "fotos", required = false) List<MultipartFile> fotos) {
        return ResponseEntity.ok(productoService.actualizar(productoId, request, fotos));
    }

    @PatchMapping(value = "/{productoId}/fotos", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDto> agregarFotos(@PathVariable Long productoId,
                                                    @RequestPart("fotos") List<MultipartFile> fotos) {
        return ResponseEntity.ok(productoService.agregarFotos(productoId, fotos));
    }

    @PatchMapping("/{productoId}/fotos/eliminar")
    public ResponseEntity<ProductoDto> eliminarFotos(@PathVariable Long productoId,
                                                     @RequestBody List<Long> fotoIds) {
        return ResponseEntity.ok(productoService.eliminarFotos(productoId, fotoIds));
    }
}
