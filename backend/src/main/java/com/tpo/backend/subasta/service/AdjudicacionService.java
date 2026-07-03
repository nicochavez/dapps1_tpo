package com.tpo.backend.subasta.service;

import com.tpo.backend.catalogo.entity.CatalogoEntity;
import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import com.tpo.backend.catalogo.repository.CatalogoRepository;
import com.tpo.backend.catalogo.repository.ItemCatalogoRepository;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.common.ws.SubastaEventPublisher;
import com.tpo.backend.notificacion.service.NotificacionService;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.duenio.entity.DuenioEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.producto.repository.ProductoRepository;
import com.tpo.backend.puja.entity.PujaEntity;
import com.tpo.backend.puja.repository.PujaRepository;
import com.tpo.backend.subasta.entity.AsistenteEntity;
import com.tpo.backend.subasta.entity.RegistroDeSubastaEntity;
import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.RegistroDeSubastaRepository;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
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

    /** Persona/empleado admin del sistema (dueno por defecto de los items sin pujas). */
    private static final Long ADMIN_PERSONA_ID = 1L;

    private final SubastaRepository subastaRepository;
    private final ItemCatalogoRepository itemRepository;
    private final PujaRepository pujaRepository;
    private final CompraRepository compraRepository;
    private final RegistroDeSubastaRepository registroRepository;
    private final SubastaEventPublisher eventPublisher;
    private final NotificacionService notificacionService;
    private final ProductoRepository productoRepository;

    public AdjudicacionService(SubastaRepository subastaRepository,
                               ItemCatalogoRepository itemRepository,
                               PujaRepository pujaRepository,
                               CompraRepository compraRepository,
                               RegistroDeSubastaRepository registroRepository,
                               SubastaEventPublisher eventPublisher,
                               NotificacionService notificacionService,
                               ProductoRepository productoRepository) {
        this.subastaRepository = subastaRepository;
        this.itemRepository = itemRepository;
        this.pujaRepository = pujaRepository;
        this.compraRepository = compraRepository;
        this.registroRepository = registroRepository;
        this.eventPublisher = eventPublisher;
        this.notificacionService = notificacionService;
        this.productoRepository = productoRepository;
    }

    /**
     * Transiciona subastas programadas a abierta cuando llega su fecha y hora.
     * Invocado periodicamente por {@link SubastaSchedulerService}.
     */
    @Transactional
    public void activarProgramadas() {
        LocalDateTime ahora = LocalDateTime.now();
        subastaRepository.findByEstado("programada").forEach(s -> {
            if (s.getFecha() == null || s.getHora() == null) return;
            if (!ahora.isBefore(LocalDateTime.of(s.getFecha(), s.getHora()))) {
                s.setEstado("abierta");
                subastaRepository.save(s);
                log.info("[SCHEDULER] Subasta {} activada (LIVE).", s.getId());
            }
        });
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
        CatalogoEntity catalogo = subastaRepository.findById(subastaId)
                .map(SubastaEntity::getCatalogo)
                .orElse(null);
        if (catalogo == null) return Optional.empty();
        return itemRepository.findByCatalogoId(catalogo.getId()).stream()
                .filter(i -> !Boolean.TRUE.equals(i.getSubastado()))
                .filter(i -> "aceptado".equals(i.getEstadoAcuerdo()))
                .min(Comparator.comparing(ItemCatalogoEntity::getId));
    }

    /**
     * Cierra el item: declara ganador / compra empresa, registra la venta y marca subastado.
     * Si no quedan items por subastar, finaliza la subasta.
     */
    @Transactional
    public void cerrarItem(SubastaEntity subasta, ItemCatalogoEntity item) {
        ProductoEntity producto = item.getProducto();
        DuenioEntity duenioActual = producto != null ? producto.getDuenio() : null;
        BigDecimal comision = item.getComision();

        Optional<PujaEntity> topPuja = pujaRepository.findFirstByItemIdOrderByImporteDesc(item.getId());

        Map<String, Object> payload = new HashMap<>();
        payload.put("itemId", item.getId());

        if (topPuja.isPresent()) {
            // RF-35 / RF-36: hay ganador.
            PujaEntity puja = topPuja.get();
            AsistenteEntity asistente = puja.getAsistente();
            ClienteEntity ganadorCliente = asistente != null ? asistente.getCliente() : null;
            BigDecimal importe = puja.getImporte();

            puja.setGanador(true);
            pujaRepository.save(puja);

            if (ganadorCliente != null) {
                String desc = producto != null ? producto.getDescripcionCatalogo() : "the item";
                notificacionService.enviar(ganadorCliente.getId(),
                        "You won the bid!",
                        "Congratulations, you won \"" + desc + "\" for $" + importe + ". Complete the purchase from My Bids.");
            }

            crearCompra(ganadorCliente, subasta, item.getProducto(), importe, comision);
            // RF-35/36: el ganador queda registrado como adjudicatario en registrodesubasta.
            crearRegistro(subasta, duenioActual, item.getProducto(), ganadorCliente, importe, comision, false);

            // El producto pasa a ser propiedad del ganador: se guarda su id de persona en
            // nuevo_duenio (duenio se conserva como el consignante original para "My Items").
            if (producto != null && ganadorCliente != null) {
                producto.setNuevoDuenio(ganadorCliente.getId());
                productoRepository.save(producto);
                log.info("[ADJUDICACION] Producto {} adjudicado: nuevo dueno = persona {}.",
                        producto.getId(), ganadorCliente.getId());
            }

            payload.put("resultado", "vendido");
            payload.put("ganadorCliente", ganadorCliente != null ? ganadorCliente.getId() : null);
            payload.put("numeroPostor", asistente != null ? asistente.getNumeroPostor() : null);
            payload.put("importe", importe);
            log.info("[ADJUDICACION] Item {} adjudicado a cliente {} por {}.",
                    item.getId(), ganadorCliente != null ? ganadorCliente.getId() : null, importe);
        } else {
            // RF-39: nadie pujo -> compra la empresa al precio base (cliente NULL + compradorEmpresa).
            BigDecimal importe = item.getPrecioBase();
            crearRegistro(subasta, duenioActual, item.getProducto(),
                    null, importe, comision, true);

            // Sin pujas: el producto pasa a ser propiedad del admin del sistema (nuevo_duenio).
            if (producto != null) {
                producto.setNuevoDuenio(ADMIN_PERSONA_ID);
                productoRepository.save(producto);
                log.info("[ADJUDICACION] Producto {} sin pujas: nuevo dueno = admin (persona {}).",
                        producto.getId(), ADMIN_PERSONA_ID);
            }

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

    private void crearCompra(ClienteEntity cliente, SubastaEntity subasta, ProductoEntity producto,
                             BigDecimal importe, BigDecimal comision) {
        CompraEntity compra = new CompraEntity();
        compra.setCliente(cliente);
        compra.setSubasta(subasta);
        compra.setProducto(producto);
        compra.setImporte(importe);
        compra.setComision(comision);
        compra.setCostoEnvio(null);
        compra.setTotal(importe.add(comision));
        compra.setRetiroPersonal(null); // el ganador elige envio o retiro luego (RF-38)
        compra.setEstadoPago("pendiente");
        compra.setFecha(OffsetDateTime.now());
        compraRepository.save(compra);
    }

    private void crearRegistro(SubastaEntity subasta, DuenioEntity duenio, ProductoEntity producto, ClienteEntity cliente,
                               BigDecimal importe, BigDecimal comision, boolean compradorEmpresa) {
        RegistroDeSubastaEntity registro = new RegistroDeSubastaEntity();
        registro.setSubasta(subasta);
        registro.setDuenio(duenio); // FK a duenios; el producto siempre tiene dueno
        registro.setProducto(producto);
        registro.setCliente(cliente);
        registro.setImporte(importe);
        registro.setComision(comision);
        registro.setCompradorEmpresa(compradorEmpresa);
        registroRepository.save(registro);
    }

    private void finalizarSiCorresponde(SubastaEntity subasta) {
        boolean quedanItems = subasta.getCatalogo() != null &&
                itemRepository.findByCatalogoId(subasta.getCatalogo().getId()).stream()
                        .filter(i -> "aceptado".equals(i.getEstadoAcuerdo()))
                        .anyMatch(i -> !Boolean.TRUE.equals(i.getSubastado()));
        if (!quedanItems) {
            subasta.setEstado("finalizada");
            subastaRepository.save(subasta);
            eventPublisher.publish(subasta.getId(), "subasta-finalizada", Map.of("subastaId", subasta.getId()));
            log.info("[ADJUDICACION] Subasta {} finalizada (sin items pendientes).", subasta.getId());
        }
    }
}
