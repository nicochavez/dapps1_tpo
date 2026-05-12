package com.tpo.backend.puja.controller;

import com.tpo.backend.puja.dto.MiPujaDto;
import com.tpo.backend.puja.dto.PujaHistorialDto;
import com.tpo.backend.puja.dto.PujaRequest;
import com.tpo.backend.puja.dto.PujaResponse;
import com.tpo.backend.puja.service.PujaService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1")
public class PujaController {

    private final PujaService pujaService;

    public PujaController(PujaService pujaService) {
        this.pujaService = pujaService;
    }

    @PostMapping("/subastas/{subastaId}/items/{itemId}/pujas")
    public ResponseEntity<PujaResponse> realizarPuja(@PathVariable Long subastaId,
                                                      @PathVariable Long itemId,
                                                      @Valid @RequestBody PujaRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(pujaService.realizarPuja(subastaId, itemId, request));
    }

    @GetMapping("/subastas/{subastaId}/items/{itemId}/pujas")
    public ResponseEntity<List<PujaHistorialDto>> getHistorial(@PathVariable Long subastaId,
                                                                @PathVariable Long itemId) {
        return ResponseEntity.ok(pujaService.getHistorialByItem(subastaId, itemId));
    }

    @GetMapping("/clientes/me/subastas/{subastaId}/pujas")
    public ResponseEntity<List<MiPujaDto>> getMisPujas(@PathVariable Long subastaId) {
        return ResponseEntity.ok(pujaService.getMisPujas(subastaId));
    }

    @GetMapping("/pujas/{productoId}")
    public ResponseEntity<List<PujaHistorialDto>> getPujasByProducto(@PathVariable Long productoId) {
        return ResponseEntity.ok(pujaService.getPujasPorProducto(productoId));
    }
}
