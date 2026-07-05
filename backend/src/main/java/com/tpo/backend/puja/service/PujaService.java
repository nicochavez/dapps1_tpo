package com.tpo.backend.puja.service;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.service.ClienteService;
import com.tpo.backend.common.exception.BadRequestException;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ForbiddenException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.common.storage.StorageService;
import com.tpo.backend.common.ws.SubastaEventPublisher;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.FotoRepository;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.subasta.service.AdjudicacionService;
import com.tpo.backend.puja.dto.MiPujaDto;
import com.tpo.backend.puja.dto.ParticipacionDto;
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
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Objects;

@Service
public class PujaService {

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemRepository;
    private final PujaRepository pujaRepository;
    private final AsistenteRepository asistenteRepository;
    private final ProductoRepository productoRepository;
    private final FotoRepository fotoRepository;
    private final ClienteService clienteService;
    private final SubastaEventPublisher eventPublisher;
    private final MedioPagoRepository medioPagoRepository;
    private final StorageService storageService;

    public PujaService(SubastaRepository subastaRepository,
                       ItemCatalogoRepository itemRepository,
                       PujaRepository pujaRepository,
                       AsistenteRepository asistenteRepository,
                       ProductoRepository productoRepository,
                       FotoRepository fotoRepository,
                       ClienteService clienteService,
                       SubastaEventPublisher eventPublisher,
                       MedioPagoRepository medioPagoRepository,
                       StorageService storageService) {
        this.subastaRepository = subastaRepository;
        this.itemRepository = itemRepository;
        this.pujaRepository = pujaRepository;
        this.asistenteRepository = asistenteRepository;
        this.productoRepository = productoRepository;
        this.fotoRepository = fotoRepository;
        this.clienteService = clienteService;
        this.eventPublisher = eventPublisher;
        this.medioPagoRepository = medioPagoRepository;
        this.storageService = storageService;
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
        AsistenteEntity asistente = asistenteRepository.findBySubastaIdAndClienteId(subastaId, clienteId)
                .orElseThrow(() -> new ConflictException("Debe conectarse a la subasta antes de pujar."));

        // RF-21: los espectadores no pueden pujar.
        if (Boolean.TRUE.equals(asistente.getEspectador())) {
            throw new ForbiddenException("Esta conectado como espectador y no puede pujar.");
        }

        // Se exige un medio de pago verificado y vigente en la moneda de la subasta para poder pujar.
        if (!medioPagoRepository.tieneMedioVerificadoEnMoneda(clienteId, subasta.getMoneda())) {
            String moneda = subasta.getMoneda() != null ? subasta.getMoneda() : "";
            throw new UnprocessableEntityException(
                    ("Necesitas un medio de pago verificado en " + moneda + " para poder pujar.").trim());
        }

        BigDecimal mejorOferta = pujaRepository.findFirstByItemIdOrderByImporteDesc(itemId)
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
        nueva.setAsistente(asistente);
        nueva.setItem(item);
        nueva.setImporte(request.getImporte());
        nueva.setFecha(OffsetDateTime.now());
        nueva.setGanador(false);
        nueva = pujaRepository.save(nueva);

        // Mantiene el item "en vivo": reinicia la ventana de cierre con cada puja (RF-25/RF-35).
        item.setCierreProgramado(OffsetDateTime.now().plusSeconds(AdjudicacionService.VENTANA_PUJA_SEGUNDOS));
        itemRepository.save(item);

        // RF-25: propaga la nueva oferta a los conectados (incluye cierre_programado para el countdown).
        eventPublisher.publish(subastaId, "nueva-puja", new java.util.HashMap<>(java.util.Map.of(
                "itemId", itemId,
                "importe", nueva.getImporte(),
                "numeroPostor", asistente.getNumeroPostor(),
                "cierreProgramado", item.getCierreProgramado().toString())));

        // RF-32: la respuesta se devuelve confirmada solo tras persistir y propagar la puja.
        return new PujaResponse(nueva.getId(), nueva.getImporte(), "no", true);
    }

    @Transactional
    public List<PujaHistorialDto> getHistorialByItem(Long subastaId, Long itemId) {
        subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        // RF-33: historial ordenado temporalmente.
        return pujaRepository.findByItemIdOrderByFechaAsc(itemId).stream()
                .map(this::toHistorialDto)
                .toList();
    }

    @Transactional
    public List<MiPujaDto> getMisPujas(Long subastaId) {
        subastaRepository.findById(subastaId)
                .orElseThrow(() -> new ResourceNotFoundException("Subasta no encontrada: " + subastaId));
        Long clienteId = clienteService.currentClienteEntity().getId();
        return asistenteRepository.findBySubastaIdAndClienteId(subastaId, clienteId)
                .map(a -> pujaRepository.findByAsistenteId(a.getId()).stream()
                        .map(this::toMiPujaDto)
                        .toList())
                .orElse(List.of());
    }

    /** Participaciones del cliente autenticado (para "My Bids"): por subasta, sus pujas + historial por item. */
    @Transactional(readOnly = true)
    public List<ParticipacionDto> getMisParticipaciones() {
        Long clienteId = clienteService.currentClienteEntity().getId();
        List<ParticipacionDto> result = new ArrayList<>();

        for (AsistenteEntity asistente : asistenteRepository.findByClienteId(clienteId)) {
            SubastaEntity subasta = asistente.getSubasta();
            if (subasta == null) continue;

            List<PujaEntity> misPujas = pujaRepository.findByAsistenteId(asistente.getId());
            if (misPujas.isEmpty()) continue; // se conectó pero no pujó

            List<ParticipacionDto.MiPujaResumen> misResumen = misPujas.stream()
                    .map(p -> new ParticipacionDto.MiPujaResumen(
                            p.getItem() != null ? p.getItem().getId() : null,
                            p.getImporte(),
                            Boolean.TRUE.equals(p.getGanador()),
                            p.getFecha() != null ? p.getFecha().toString() : null))
                    .toList();
            boolean won = misPujas.stream().anyMatch(p -> Boolean.TRUE.equals(p.getGanador()));

            CatalogoEntity catalogo = subasta.getCatalogo();
            boolean abierta = "abierta".equalsIgnoreCase(subasta.getEstado());
            Long loteActual = catalogo != null ? currentLotIdOf(catalogo.getId()) : null;

            List<Long> itemIds = misPujas.stream()
                    .map(p -> p.getItem() != null ? p.getItem().getId() : null)
                    .filter(Objects::nonNull).distinct().toList();

            List<ParticipacionDto.ItemParticipacion> items = new ArrayList<>();
            String itemCategory = null;
            for (Long itemId : itemIds) {
                ItemCatalogoEntity item = itemRepository.findById(itemId).orElse(null);
                if (item == null) continue;
                ProductoEntity prod = item.getProducto();
                if (itemCategory == null && prod != null) itemCategory = prod.getCategoria();
                boolean enPuja = abierta && !Boolean.TRUE.equals(item.getSubastado())
                        && item.getId().equals(loteActual);
                List<PujaHistorialDto> historial = pujaRepository.findByItemIdOrderByFechaAsc(itemId).stream()
                        .map(this::toHistorialDto).toList();
                items.add(new ParticipacionDto.ItemParticipacion(
                        itemId,
                        prod != null ? prod.getDescripcionCatalogo() : "",
                        firstFotoUrl(prod),
                        enPuja,
                        historial));
            }

            result.add(new ParticipacionDto(
                    subasta.getId(),
                    catalogo != null ? catalogo.getId() : null,
                    catalogo != null ? catalogo.getDescripcion() : null,
                    items.isEmpty() ? null : items.get(0).getImagen(),
                    subasta.getCategoria(),
                    itemCategory,
                    abierta,
                    won,
                    misResumen,
                    items));
        }
        return result;
    }

    /** Lote actual del catálogo (primer item no subastado por id), igual criterio que la adjudicación. */
    private Long currentLotIdOf(Long catalogoId) {
        return itemRepository.findByCatalogoId(catalogoId).stream()
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .map(ItemCatalogoEntity::getId)
                .min(Comparator.naturalOrder())
                .orElse(null);
    }

    private String firstFotoUrl(ProductoEntity prod) {
        if (prod == null) return null;
        var fotos = fotoRepository.findByProductoId(prod.getId());
        return fotos.isEmpty() ? null : storageService.presignGet(fotos.get(0).getUrl());
    }

    @Transactional
    public List<PujaHistorialDto> getPujasPorProducto(Long productoId) {
        return itemRepository.findByProductoId(productoId)
                .map(item -> pujaRepository.findByItemIdOrderByImporteDesc(item.getId()).stream()
                        .map(this::toHistorialDto)
                        .toList())
                .orElse(List.of());
    }

    private PujaHistorialDto toHistorialDto(PujaEntity p) {
        Integer numeroPostor = p.getAsistente().getNumeroPostor();
        return new PujaHistorialDto(
                p.getId(),
                numeroPostor,
                p.getImporte(),
                Boolean.TRUE.equals(p.getGanador()) ? "si" : "no",
                p.getFecha() != null ? p.getFecha().toString() : null
        );
    }

    private MiPujaDto toMiPujaDto(PujaEntity p) {
        ItemCatalogoEntity item = p.getItem();
        String desc = "";
        if (item != null) {
            ProductoEntity prod = item.getProducto();
            desc = prod != null ? prod.getDescripcionCatalogo() : "";
        }
        return new MiPujaDto(
                new MiPujaDto.ItemRefDto(item != null ? item.getId() : null, desc),
                p.getImporte(),
                Boolean.TRUE.equals(p.getGanador()) ? "si" : "no"
        );
    }
}
