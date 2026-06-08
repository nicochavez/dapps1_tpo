package com.tpo.backend.subasta.service;

import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.common.ws.SubastaEventPublisher;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.puja.entity.PujaEntity;
import com.tpo.backend.puja.repository.PujaRepository;
import com.tpo.backend.subasta.entity.AsistenteEntity;
import com.tpo.backend.subasta.entity.RegistroDeSubastaEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.AsistenteRepository;
import com.tpo.backend.subasta.repository.RegistroDeSubastaRepository;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.Comparator;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.Optional;

/**
 * Cierre y adjudicacion de items de una subasta (RF-35, 36, 38, 39).
 * Disparado por {@link SubastaSchedulerService} cuando expira la ventana de puja.
 */
@Service
public class AdjudicacionService {

    private static final Logger log = LoggerFactory.getLogger(AdjudicacionService.class);

    /** Ventana de inactividad tras la cual se cierra el item en curso (segundos). */
    public static final long VENTANA_PUJA_SEGUNDOS = 60;

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemRepository;
    private final ProductoRepository productoRepository;
    private final PujaRepository pujaRepository;
    private final AsistenteRepository asistenteRepository;
    private final CompraRepository compraRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final SubastaEventPublisher eventPublisher;

    public AdjudicacionService(SubastaRepository subastaRepository,
                               ItemCatalogoRepository itemRepository,
                               ProductoRepository productoRepository,
                               PujaRepository pujaRepository,
                               AsistenteRepository asistenteRepository,
                               CompraRepository compraRepository,
                               RegistroDeSubastaRepository registroRepository,
                               SubastaEventPublisher eventPublisher) {
        this.subastaRepository = subastaRepository;
        this.itemRepository = itemRepository;
        this.productoRepository = productoRepository;
        this.pujaRepository = pujaRepository;
        this.asistenteRepository = asistenteRepository;
        this.compraRepository = compraRepository;
        this.registroRepository = registroRepository;
        this.eventPublisher = eventPublisher;
    }

    /**
     * Avanza el ciclo de vida de una subasta abierta:
     * abre la ventana del item en curso, o lo cierra si la ventana expiro.
     * Invocado periodicamente por {@link SubastaSchedulerService}.
     */
    @Transactional
    public void procesarSubasta(Long subastaId) {
        SubastaEntity subasta = subastaRepository.findById(subastaId).orElse(null);
        if (subasta == null || !"abierta".equalsIgnoreCase(subasta.getEstado())) {
            return;
        }

        Optional<ItemCatalogoEntity> actual = currentItem(subastaId);
        if (actual.isEmpty()) {
            finalizarSiCorresponde(subasta);
            return;
        }

        ItemCatalogoEntity item = actual.get();
        OffsetDateTime now = OffsetDateTime.now();

        if (item.getCierreProgramado() == null) {
            // El item pasa a estar "en vivo": se abre su ventana de puja.
            item.setCierreProgramado(now.plusSeconds(VENTANA_PUJA_SEGUNDOS));
            itemRepository.save(item);
            Map<String, Object> payload = new HashMap<>();
            payload.put("itemId", item.getId());
            payload.put("cierreProgramado", item.getCierreProgramado().toString());
            eventPublisher.publish(subastaId, "item-actual", payload);
        } else if (!now.isBefore(item.getCierreProgramado())) {
            cerrarItem(subasta, item);
        }
    }

    /** Primer item no subastado de la subasta (item en curso). */
    @Transactional
    public Optional<ItemCatalogoEntity> currentItem(Long subastaId) {
        Long catalogoId = subastaRepository.findById(subastaId)
                .map(SubastaEntity::getCatalogo)
                .orElse(null);
        if (catalogoId == null) return Optional.empty();
        return itemRepository.findByCatalogo(catalogoId).stream()
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .min(Comparator.comparing(ItemCatalogoEntity::getId));
    }

    /**
     * Cierra el item: declara ganador / compra empresa, registra la venta y marca subastado.
     * Si no quedan items por subastar, finaliza la subasta.
     */
    @Transactional
    public void cerrarItem(SubastaEntity subasta, ItemCatalogoEntity item) {
        ProductoEntity producto = productoRepository.findById(item.getProducto()).orElse(null);
        Long duenioActual = producto != null ? producto.getDuenio() : null;
        BigDecimal comision = item.getComision();

        Optional<PujaEntity> topPuja = pujaRepository.findFirstByItemOrderByImporteDesc(item.getId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("itemId", item.getId());

        if (topPuja.isPresent()) {
            // RF-35 / RF-36: hay ganador.
            PujaEntity puja = topPuja.get();
            AsistenteEntity asistente = asistenteRepository.findById(puja.getAsistente()).orElse(null);
            Long ganadorClienteId = asistente != null ? asistente.getCliente() : null;
            BigDecimal importe = puja.getImporte();

            puja.setGanador(true);
            pujaRepository.save(puja);

            crearCompra(ganadorClienteId, subasta.getId(), item.getProducto(), importe, comision);
            // RF-35/36: el ganador queda registrado como adjudicatario en registrodesubasta.
            // No se reasigna productos.duenio porque esa FK apunta a 'duenios' (rol consignante),
            // no a 'clientes'; el nuevo titular se desprende del registro de adjudicacion.
            crearRegistro(subasta.getId(), duenioActual, item.getProducto(), ganadorClienteId, importe, comision, false);

            payload.put("resultado", "vendido");
            payload.put("ganadorCliente", ganadorClienteId);
            payload.put("numeroPostor", asistente != null ? asistente.getNumeroPostor() : null);
            payload.put("importe", importe);
            log.info("[ADJUDICACION] Item {} adjudicado a cliente {} por {}.",
                    item.getId(), ganadorClienteId, importe);
        } else {
            // RF-39: nadie pujo -> compra la empresa al precio base (cliente NULL + compradorEmpresa).
            BigDecimal importe = item.getPrecioBase();
            crearRegistro(subasta.getId(), duenioActual, item.getProducto(),
                    null, importe, comision, true);

            payload.put("resultado", "empresa");
            payload.put("importe", importe);
            log.info("[ADJUDICACION] Item {} sin pujas: comprado por la empresa a precio base {}.",
                    item.getId(), importe);
        }

        item.setSubastado(true);
        item.setCierreProgramado(null);
        itemRepository.save(item);

        eventPublisher.publish(subasta.getId(), "item-cerrado", payload);

        finalizarSiCorresponde(subasta);
    }

    private void crearCompra(Long clienteId, Long subastaId, Long productoId,
                             BigDecimal importe, BigDecimal comision) {
        CompraEntity compra = new CompraEntity();
        compra.setCliente(clienteId);
        compra.setSubasta(subastaId);
        compra.setProducto(productoId);
        compra.setImporte(importe);
        compra.setComision(comision);
        compra.setCostoEnvio(null);
        compra.setTotal(importe.add(comision));
        compra.setRetiroPersonal(null); // el ganador elige envio o retiro luego (RF-38)
        compra.setFecha(OffsetDateTime.now());
        compraRepository.save(compra);
    }

    private void crearRegistro(Long subastaId, Long duenioId, Long productoId, Long clienteId,
                               BigDecimal importe, BigDecimal comision, boolean compradorEmpresa) {
        RegistroDeSubastaEntity registro = new RegistroDeSubastaEntity();
        registro.setSubasta(subastaId);
        registro.setDuenio(duenioId); // FK a duenios; el producto siempre tiene dueno
        registro.setProducto(productoId);
        registro.setCliente(clienteId);
        registro.setImporte(importe);
        registro.setComision(comision);
        registro.setCompradorEmpresa(compradorEmpresa);
        registroRepository.save(registro);
    }

    private void finalizarSiCorresponde(SubastaEntity subasta) {
        boolean quedanItems = subasta.getCatalogo() != null &&
                itemRepository.findByCatalogo(subasta.getCatalogo()).stream()
                        .anyMatch(i -> !Boolean.TRUE.equals(i.getSubastado()));
        if (!quedanItems) {
            subasta.setEstado("finalizada");
            subastaRepository.save(subasta);
            eventPublisher.publish(subasta.getId(), "subasta-finalizada", Map.of("subastaId", subasta.getId()));
            log.info("[ADJUDICACION] Subasta {} finalizada (sin items pendientes).", subasta.getId());
        }
    }
}
