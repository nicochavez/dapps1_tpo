package com.tpo.backend.subasta.service;

import com.tpo.backend.common.dto.PagedResponse;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ForbiddenException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.mock.MockDataStore;
import com.tpo.backend.subasta.dto.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.concurrent.atomic.AtomicInteger;

@Service
public class SubastaService {

    private final MockDataStore store;
    private final AtomicInteger postorCounter = new AtomicInteger(100);

    public SubastaService(MockDataStore store) {
        this.store = store;
    }

    public PagedResponse<SubastaListItemDto> listar(String estado, String categoria, String moneda, int page, int size) {
        List<SubastaListItemDto> filtered = store.subastas.stream()
                .filter(s -> estado == null || s.getEstado().equalsIgnoreCase(estado))
                .filter(s -> categoria == null || s.getCategoria().equalsIgnoreCase(categoria))
                .filter(s -> moneda == null || s.getMoneda().equalsIgnoreCase(moneda))
                .toList();

        int total = filtered.size();
        int from = Math.min(page * size, total);
        int to = Math.min(from + size, total);
        List<SubastaListItemDto> content = filtered.subList(from, to);
        int totalPages = (int) Math.ceil((double) total / size);

        return new PagedResponse<>(content, totalPages, total, page, size);
    }

    public SubastaDetailDto getById(Long id) {
        SubastaListItemDto item = store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(id))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + id));

        CatalogoDto cat = store.subastaCatalogo.get(id);

        return new SubastaDetailDto(
                item.getIdentificador(),
                item.getFecha(),
                item.getHora(),
                item.getEstado(),
                item.getUbicacion(),
                item.getCategoria(),
                item.getMoneda(),
                100,
                item.getSubastador(),
                cat
        );
    }

    public ConectarResponse conectar(Long subastaId) {
        SubastaListItemDto subasta = store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));

        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new ConflictException("La subasta no esta abierta.");
        }

        // Check if user is already connected to another subasta
        Long clienteId = 1L; // mock authenticated user
        boolean connectedElsewhere = store.conectados.entrySet().stream()
                .anyMatch(e -> !e.getKey().equals(subastaId) && e.getValue().contains(clienteId));
        if (connectedElsewhere) {
            throw new ForbiddenException("Ya esta conectado a otra subasta.");
        }

        boolean hasVerifiedMedio = store.mediosPago.stream().anyMatch(m -> m.isVerificado());
        if (!hasVerifiedMedio) {
            throw new ForbiddenException("No tiene medio de pago verificado.");
        }

        store.conectados.computeIfAbsent(subastaId, k -> new java.util.HashSet<>()).add(clienteId);
        int numeroPostor = postorCounter.incrementAndGet();

        return new ConectarResponse(new AsistenteDto(clienteId, numeroPostor));
    }

    public void desconectar(Long subastaId) {
        store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        Long clienteId = 1L;
        if (store.conectados.containsKey(subastaId)) {
            store.conectados.get(subastaId).remove(clienteId);
        }
    }

    public ItemActualDto getItemActual(Long subastaId) {
        store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));

        Long itemId = store.currentItem.get(subastaId);
        if (itemId == null) {
            throw new ResourceNotFoundException("No hay item activo en esta subasta.");
        }

        CatalogoDto cat = store.subastaCatalogo.get(subastaId);
        if (cat == null) {
            throw new ResourceNotFoundException("Catalogo no encontrado.");
        }

        ItemCatalogoDto itemDto = cat.getItems().stream()
                .filter(i -> i.getIdentificador().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));

        Object[] bid = store.bestBid.getOrDefault(itemId, new Object[]{itemDto.getPrecioBase(), null});
        BigDecimal mejorOferta = (BigDecimal) bid[0];
        Integer numeroPostor = bid[1] != null ? (Integer) bid[1] : null;

        return new ItemActualDto(
                new ItemActualDto.ItemInfoDto(itemDto.getIdentificador(), itemDto.getDescripcion(),
                        itemDto.getPrecioBase(), itemDto.getImagenes()),
                new ItemActualDto.MejorOfertaDto(mejorOferta, numeroPostor)
        );
    }

    public List<SubastaListItemDto> getSubastas() {
        return store.subastas;
    }
}
