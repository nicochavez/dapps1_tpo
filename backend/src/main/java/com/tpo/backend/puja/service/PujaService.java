package com.tpo.backend.puja.service;

import com.tpo.backend.common.exception.BadRequestException;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.mock.MockDataStore;
import com.tpo.backend.puja.dto.MiPujaDto;
import com.tpo.backend.puja.dto.PujaHistorialDto;
import com.tpo.backend.puja.dto.PujaRequest;
import com.tpo.backend.puja.dto.PujaResponse;
import com.tpo.backend.subasta.dto.CatalogoDto;
import com.tpo.backend.subasta.dto.ItemCatalogoDto;
import com.tpo.backend.subasta.dto.SubastaListItemDto;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class PujaService {

    private final MockDataStore store;

    public PujaService(MockDataStore store) {
        this.store = store;
    }

    public PujaResponse realizarPuja(Long subastaId, Long itemId, PujaRequest request) {
        SubastaListItemDto subasta = store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));

        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new ConflictException("La subasta no esta activa.");
        }

        CatalogoDto cat = store.subastaCatalogo.get(subastaId);
        if (cat == null) {
            throw new ResourceNotFoundException("Catalogo no encontrado para subasta: " + subastaId);
        }

        ItemCatalogoDto item = cat.getItems().stream()
                .filter(i -> i.getIdentificador().equals(itemId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));

        if ("si".equalsIgnoreCase(item.getSubastado())) {
            throw new ConflictException("El item ya fue subastado.");
        }

        Object[] bid = store.bestBid.getOrDefault(itemId, new Object[]{item.getPrecioBase(), null});
        BigDecimal mejorOferta = (BigDecimal) bid[0];

        // Validate puja limits (not applied for oro/platino)
        boolean sinLimites = "oro".equalsIgnoreCase(subasta.getCategoria()) ||
                "platino".equalsIgnoreCase(subasta.getCategoria());

        if (!sinLimites) {
            BigDecimal minimo = mejorOferta.add(item.getPrecioBase().multiply(new BigDecimal("0.01")));
            BigDecimal maximo = mejorOferta.add(item.getPrecioBase().multiply(new BigDecimal("0.20")));
            if (request.getImporte().compareTo(minimo) < 0 || request.getImporte().compareTo(maximo) > 0) {
                throw new BadRequestException(
                        String.format("Importe debe estar entre %.2f y %.2f", minimo, maximo));
            }
        } else {
            if (request.getImporte().compareTo(mejorOferta) <= 0) {
                throw new BadRequestException("El importe debe ser mayor a la mejor oferta actual.");
            }
        }

        // Update best bid
        store.bestBid.put(itemId, new Object[]{request.getImporte(), 42});

        // Record puja
        long pujaId = store.nextPujaId();
        PujaHistorialDto nuevaPuja = new PujaHistorialDto(
                pujaId, 42, request.getImporte(), "no",
                LocalDateTime.now().toString()
        );
        store.pujasByItem.computeIfAbsent(itemId, k -> new java.util.ArrayList<>()).add(nuevaPuja);

        // Add to my pujas
        MiPujaDto miPuja = new MiPujaDto(
                new MiPujaDto.ItemRefDto(itemId, item.getDescripcion()),
                request.getImporte(), "no"
        );
        store.misPujas.computeIfAbsent(1L, k -> new java.util.ArrayList<>()).add(miPuja);

        return new PujaResponse(pujaId, request.getImporte(), "no", true);
    }

    public List<PujaHistorialDto> getHistorialByItem(Long subastaId, Long itemId) {
        store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));

        return store.pujasByItem.getOrDefault(itemId, List.of());
    }

    public List<MiPujaDto> getMisPujas(Long subastaId) {
        store.subastas.stream()
                .filter(s -> s.getIdentificador().equals(subastaId))
                .findFirst()
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        return store.misPujas.getOrDefault(1L, List.of());
    }
}
