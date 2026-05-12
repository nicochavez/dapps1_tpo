package com.tpo.backend.puja.service;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.BadRequestException;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.puja.dto.MiPujaDto;
import com.tpo.backend.puja.dto.PujaHistorialDto;
import com.tpo.backend.puja.dto.PujaRequest;
import com.tpo.backend.puja.dto.PujaResponse;
import com.tpo.backend.puja.entity.PujaEntity;
import com.tpo.backend.puja.repository.PujaRepository;
import com.tpo.backend.subasta.entity.AsistenteEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.AsistenteRepository;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

@Service
public class PujaService {

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemRepository;
    private final PujaRepository pujaRepository;
    private final AsistenteRepository asistenteRepository;
    private final ProductoRepository productoRepository;
    private final ClienteService clienteService;

    public PujaService(SubastaRepository subastaRepository,
                       ItemCatalogoRepository itemRepository,
                       PujaRepository pujaRepository,
                       AsistenteRepository asistenteRepository,
                       ProductoRepository productoRepository,
                       ClienteService clienteService) {
        this.subastaRepository = subastaRepository;
        this.itemRepository = itemRepository;
        this.pujaRepository = pujaRepository;
        this.asistenteRepository = asistenteRepository;
        this.productoRepository = productoRepository;
        this.clienteService = clienteService;
    }

    @Transactional
    public PujaResponse realizarPuja(Long subastaId, Long itemId, PujaRequest request) {
        SubastaEntity subasta = subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));

        if (!"abierta".equalsIgnoreCase(subasta.getEstado())) {
            throw new ConflictException("La subasta no esta activa.");
        }

        ItemCatalogoEntity item = itemRepository.findById(itemId)
                .orElseThrow(() -> new ResourceNotFoundException("Item no encontrado: " + itemId));

        if (Boolean.TRUE.equals(item.getSubastado())) {
            throw new ConflictException("El item ya fue subastado.");
        }

        Long clienteId = clienteService.currentClienteEntity().getId();
        AsistenteEntity asistente = asistenteRepository.findBySubastaAndCliente(subastaId, clienteId)
                .orElseThrow(() -> new ConflictException("Debe conectarse a la subasta antes de pujar."));

        BigDecimal mejorOferta = pujaRepository.findFirstByItemOrderByImporteDesc(itemId)
                .map(PujaEntity::getImporte)
                .orElse(item.getPrecioBase());

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

        PujaEntity nueva = new PujaEntity();
        nueva.setAsistente(asistente.getId());
        nueva.setItem(itemId);
        nueva.setImporte(request.getImporte());
        nueva.setFecha(OffsetDateTime.now());
        nueva.setGanador(false);
        nueva = pujaRepository.save(nueva);

        return new PujaResponse(nueva.getId(), nueva.getImporte(), "no", true);
    }

    @Transactional
    public List<PujaHistorialDto> getHistorialByItem(Long subastaId, Long itemId) {
        subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        return pujaRepository.findByItemOrderByImporteDesc(itemId).stream()
                .map(this::toHistorialDto)
                .toList();
    }

    @Transactional
    public List<MiPujaDto> getMisPujas(Long subastaId) {
        subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        Long clienteId = clienteService.currentClienteEntity().getId();
        return asistenteRepository.findBySubastaAndCliente(subastaId, clienteId)
                .map(a -> pujaRepository.findByAsistente(a.getId()).stream()
                        .map(this::toMiPujaDto)
                        .toList())
                .orElse(List.of());
    }

    @Transactional
    public List<PujaHistorialDto> getPujasPorProducto(Long productoId) {
        return itemRepository.findByProducto(productoId)
                .map(item -> pujaRepository.findByItemOrderByImporteDesc(item.getId()).stream()
                        .map(this::toHistorialDto)
                        .toList())
                .orElse(List.of());
    }

    private PujaHistorialDto toHistorialDto(PujaEntity p) {
        Integer numeroPostor = asistenteRepository.findById(p.getAsistente())
                .map(AsistenteEntity::getNumeroPostor).orElse(null);
        return new PujaHistorialDto(
                p.getId(),
                numeroPostor,
                p.getImporte(),
                Boolean.TRUE.equals(p.getGanador()) ? "si" : "no",
                p.getFecha() != null ? p.getFecha().toString() : null
        );
    }

    private MiPujaDto toMiPujaDto(PujaEntity p) {
        ItemCatalogoEntity item = itemRepository.findById(p.getItem()).orElse(null);
        String desc = "";
        if (item != null) {
            ProductoEntity prod = productoRepository.findById(item.getProducto()).orElse(null);
            desc = prod != null ? prod.getDescripcionCatalogo() : "";
        }
        return new MiPujaDto(
                new MiPujaDto.ItemRefDto(p.getItem(), desc),
                p.getImporte(),
                Boolean.TRUE.equals(p.getGanador()) ? "si" : "no"
        );
    }
}
