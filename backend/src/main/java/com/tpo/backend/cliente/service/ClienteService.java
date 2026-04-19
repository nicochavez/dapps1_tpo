package com.tpo.backend.cliente.service;

import com.tpo.backend.cliente.dto.ClienteDto;
import com.tpo.backend.cliente.dto.ClienteUpdateRequest;
import com.tpo.backend.cliente.dto.MetricasDto;
import com.tpo.backend.common.mock.MockDataStore;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.Map;

@Service
public class ClienteService {

    private final MockDataStore store;

    public ClienteService(MockDataStore store) {
        this.store = store;
    }

    public ClienteDto getAuthenticatedCliente() {
        return store.getAuthenticatedCliente();
    }

    public ClienteDto updateCliente(ClienteUpdateRequest request) {
        ClienteDto cliente = store.getAuthenticatedCliente();
        if (request.getDireccion() != null) {
            cliente.setDireccion(request.getDireccion());
        }
        return cliente;
    }

    public MetricasDto getMetricas() {
        return new MetricasDto(
                10,
                3,
                new BigDecimal("150000.00"),
                new BigDecimal("75000.00"),
                Map.of(
                        "comun", 5,
                        "especial", 3,
                        "plata", 2,
                        "oro", 0,
                        "platino", 0
                )
        );
    }
}
