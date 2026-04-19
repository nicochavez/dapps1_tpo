package com.tpo.backend.auth.service;

import com.tpo.backend.auth.dto.LoginRequest;
import com.tpo.backend.auth.dto.LoginResponse;
import com.tpo.backend.auth.dto.RegisterRequest;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnauthorizedException;
import com.tpo.backend.common.mock.MockDataStore;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final MockDataStore store;

    public AuthService(MockDataStore store) {
        this.store = store;
    }

    public void register(RegisterRequest request) {
        String doc = request.getDocumento();

        // Check first stage was approved (credential key exists)
        if (!store.credentials.containsKey(doc)) {
            throw new ResourceNotFoundException("No se encontro persona con primera etapa aprobada.");
        }

        // Check not already registered
        if (Boolean.TRUE.equals(store.registered.get(doc))) {
            throw new ConflictException("El usuario ya completo su registro.");
        }

        store.credentials.put(doc, request.getPassword());
        store.registered.put(doc, true);
    }

    public LoginResponse login(LoginRequest request) {
        String doc = request.getDocumento();
        String storedPwd = store.credentials.get(doc);

        if (storedPwd == null || !storedPwd.equals(request.getPassword())) {
            throw new UnauthorizedException("Credenciales invalidas.");
        }

        if (!Boolean.TRUE.equals(store.registered.get(doc))) {
            throw new UnauthorizedException("Credenciales invalidas.");
        }

        // Return a mock JWT token
        String mockToken = "mock-jwt-token-for-" + doc;
        return new LoginResponse(mockToken);
    }
}
