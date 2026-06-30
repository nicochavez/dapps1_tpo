package com.tpo.backend.producto.controller;

import com.tpo.backend.auth.security.AuthenticatedUser;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.producto.dto.ProductoDto;
import com.tpo.backend.producto.dto.ProductoNewRequest;
import com.tpo.backend.producto.dto.ProductoUpdateRequest;
import com.tpo.backend.producto.dto.PropuestaDto;
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

    /** Sirve los bytes de una foto del producto. Publico: lo consume el <Image> de RN sin token. */
    @GetMapping("/{productoId}/fotos/{fotoId}")
    public ResponseEntity<byte[]> getFoto(@PathVariable Long productoId, @PathVariable Long fotoId) {
        byte[] bytes = productoService.getFotoBytes(productoId, fotoId);
        return ResponseEntity.ok()
                .contentType(detectImageType(bytes))
                .body(bytes);
    }

    private static MediaType detectImageType(byte[] bytes) {
        if (bytes != null && bytes.length >= 4) {
            if ((bytes[0] & 0xFF) == 0x89 && bytes[1] == 0x50 && bytes[2] == 0x4E && bytes[3] == 0x47) {
                return MediaType.IMAGE_PNG;
            }
        }
        return MediaType.IMAGE_JPEG;
    }

    @GetMapping("/me")
    public ResponseEntity<List<ProductoDto>> listarMios(@AuthenticationPrincipal AuthenticatedUser me) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.ok(productoService.listarPorDuenio(me.personaId()));
    }

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<ProductoDto> crear(@AuthenticationPrincipal AuthenticatedUser me,
                                             @Valid @ModelAttribute ProductoNewRequest request) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(productoService.crear(me.personaId(), request, request.getFotos()));
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

    // --- Propuesta de condiciones: el dueno consulta y acepta/rechaza --------

    @GetMapping("/{productoId}/propuesta")
    public ResponseEntity<PropuestaDto> getPropuesta(@AuthenticationPrincipal AuthenticatedUser me,
                                                     @PathVariable Long productoId) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.ok(productoService.getPropuesta(me.personaId(), productoId));
    }

    @PostMapping("/{productoId}/propuesta/aceptar")
    public ResponseEntity<ProductoDto> aceptarPropuesta(@AuthenticationPrincipal AuthenticatedUser me,
                                                        @PathVariable Long productoId) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.ok(productoService.aceptarPropuesta(me.personaId(), productoId));
    }

    @PostMapping("/{productoId}/propuesta/rechazar")
    public ResponseEntity<ProductoDto> rechazarPropuesta(@AuthenticationPrincipal AuthenticatedUser me,
                                                         @PathVariable Long productoId) {
        if (me == null) throw new UnauthorizedException("No autenticado: falta o es invalido el token.");
        return ResponseEntity.ok(productoService.rechazarPropuesta(me.personaId(), productoId));
    }
}
