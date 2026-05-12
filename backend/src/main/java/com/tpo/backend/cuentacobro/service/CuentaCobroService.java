package com.tpo.backend.cuentacobro.service;

import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.cuentacobro.dto.CuentaCobroDto;
import com.tpo.backend.cuentacobro.dto.CuentaCobroRequest;
import com.tpo.backend.cuentacobro.entity.CuentaCobroEntity;
import com.tpo.backend.cuentacobro.repository.CuentaCobroRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class CuentaCobroService {

    private final CuentaCobroRepository cuentaCobroRepository;
    private final ClienteService clienteService;

    public CuentaCobroService(CuentaCobroRepository cuentaCobroRepository,
                              ClienteService clienteService) {
        this.cuentaCobroRepository = cuentaCobroRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public List<CuentaCobroDto> listar() {
        Long clienteId = clienteService.currentClienteEntity().getId();
        return cuentaCobroRepository.findByCliente(clienteId).stream()
                .map(this::toDto)
                .toList();
    }

    @Transactional
    public CuentaCobroDto crear(CuentaCobroRequest request) {
        Long clienteId = clienteService.currentClienteEntity().getId();
        CuentaCobroEntity cuenta = new CuentaCobroEntity();
        cuenta.setCliente(clienteId);
        cuenta.setBanco(request.getBanco());
        cuenta.setNumeroCuenta(request.getNumeroCuenta());
        cuenta.setMoneda(request.getMoneda());
        cuenta.setPais(request.getPais());
        cuenta = cuentaCobroRepository.save(cuenta);
        return toDto(cuenta);
    }

    @Transactional
    public void eliminar(Long id) {
        CuentaCobroEntity cuenta = cuentaCobroRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Cuenta de cobro no encontrada: " + id));
        cuentaCobroRepository.delete(cuenta);
    }

    private CuentaCobroDto toDto(CuentaCobroEntity c) {
        return new CuentaCobroDto(c.getId(), c.getBanco(), c.getNumeroCuenta(), c.getMoneda(), c.getPais());
    }
}
