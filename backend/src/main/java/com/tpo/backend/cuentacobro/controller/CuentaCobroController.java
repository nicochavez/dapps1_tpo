package com.tpo.backend.cuentacobro.controller;

import com.tpo.backend.cuentacobro.dto.CuentaCobroDto;
import com.tpo.backend.cuentacobro.dto.CuentaCobroRequest;
import com.tpo.backend.cuentacobro.service.CuentaCobroService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/clientes/me/cuentas-cobro")
public class CuentaCobroController {

    private final CuentaCobroService cuentaCobroService;

    public CuentaCobroController(CuentaCobroService cuentaCobroService) {
        this.cuentaCobroService = cuentaCobroService;
    }

    @GetMapping
    public ResponseEntity<List<CuentaCobroDto>> listar() {
        return ResponseEntity.ok(cuentaCobroService.listar());
    }

    @PostMapping
    public ResponseEntity<CuentaCobroDto> crear(@Valid @RequestBody CuentaCobroRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(cuentaCobroService.crear(request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> eliminar(@PathVariable Long id) {
        cuentaCobroService.eliminar(id);
        return ResponseEntity.noContent().build();
    }
}
