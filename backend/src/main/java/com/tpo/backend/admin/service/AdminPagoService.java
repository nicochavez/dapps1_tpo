package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.PagoPendienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.common.exception.UnprocessableEntityException;
import com.tpo.backend.compra.entity.CompraEntity;
import com.tpo.backend.compra.repository.CompraRepository;
import com.tpo.backend.multa.dto.MultaDto;
import com.tpo.backend.multa.entity.MultaEntity;
import com.tpo.backend.multa.repository.MultaRepository;
import com.tpo.backend.notificacion.service.NotificacionService;
import com.tpo.backend.persona.PersonaEntity;
import com.tpo.backend.producto.entity.ProductoEntity;
import com.tpo.backend.usuario.entity.UsuarioEntity;
import com.tpo.backend.usuario.repository.UsuarioRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.OffsetDateTime;
import java.util.List;

/**
 * Backoffice de pagos y multas (solo empleados; ver SecurityConfig {@code /api/v1/admin/**}).
 * Permite listar las compras con pago pendiente y aplicar una multa (10% del valor del
 * producto) al deudor, notificandolo.
 */
@Service
public class AdminPagoService {

    private static final Logger log = LoggerFactory.getLogger(AdminPagoService.class);

    /** La multa es el 10% del valor del producto adjudicado. */
    private static final BigDecimal PORCENTAJE_MULTA = new BigDecimal("0.10");

    /** Plazo por defecto para abonar la multa. */
    private static final int DIAS_LIMITE_MULTA = 7;

    private final CompraRepository compraRepository;
    private final MultaRepository multaRepository;
    private final NotificacionService notificacionService;
    private final UsuarioRepository usuarioRepository;

    public AdminPagoService(CompraRepository compraRepository,
                            MultaRepository multaRepository,
                            NotificacionService notificacionService,
                            UsuarioRepository usuarioRepository) {
        this.compraRepository = compraRepository;
        this.multaRepository = multaRepository;
        this.notificacionService = notificacionService;
        this.usuarioRepository = usuarioRepository;
    }

    /** Compras con estado_pago = 'pendiente' (usuarios que deben pagar). */
    @Transactional(readOnly = true)
    public List<PagoPendienteDto> listarPagosPendientes() {
        return compraRepository.findByEstadoPago("pendiente").stream()
                .map(this::toDto)
                .toList();
    }

    /** Aplica una multa (10% del valor del producto) al cliente de una compra impaga y lo notifica. */
    @Transactional
    public MultaDto asignarMulta(Long compraId) {
        CompraEntity compra = compraRepository.findById(compraId)
                .orElseThrow(() -> new ResourceNotFoundException("Compra no encontrada: " + compraId));

        if (!"pendiente".equalsIgnoreCase(compra.getEstadoPago())) {
            throw new UnprocessableEntityException(
                    "La compra no tiene el pago pendiente (estado actual: " + compra.getEstadoPago() + ").");
        }

        boolean yaTiene = multaRepository.findByCompraId(compraId).stream()
                .anyMatch(m -> "pendiente".equalsIgnoreCase(m.getEstado()));
        if (yaTiene) {
            throw new ConflictException("La compra ya tiene una multa pendiente asignada.");
        }

        BigDecimal importe = compra.getImporte();
        BigDecimal valorMulta = importe.multiply(PORCENTAJE_MULTA);

        MultaEntity multa = new MultaEntity();
        multa.setCliente(compra.getCliente());
        multa.setCompra(compra);
        multa.setImporteOriginal(importe);
        multa.setMulta(valorMulta);
        multa.setEstado("pendiente");
        multa.setFechaLimite(OffsetDateTime.now().plusDays(DIAS_LIMITE_MULTA));
        multaRepository.save(multa);

        ProductoEntity producto = compra.getProducto();
        String nombreProducto = producto != null ? producto.getDescripcionCatalogo() : "your purchase";
        notificacionService.enviar(compra.getCliente().getId(),
                "Fine applied",
                "A fine of $" + valorMulta + " (10%) was applied for the unpaid purchase of \""
                        + nombreProducto + "\". Pay it to keep participating in auctions. "
                        + "If you don't resolve it within 72hrs, your access to the app will be "
                        + "disabled and the case will be referred to the courts.");

        log.info("[ADMIN] Multa de {} asignada al cliente {} por la compra {} impaga.",
                valorMulta, compra.getCliente().getId(), compraId);

        return new MultaDto(
                multa.getId(),
                multa.getImporteOriginal(),
                multa.getMulta(),
                multa.getEstado(),
                multa.getFechaLimite() != null ? multa.getFechaLimite().toString() : null,
                new MultaDto.CompraRefDto(compra.getId(), nombreProducto));
    }

    /** Bloquea el acceso de un usuario a la app (deshabilita su login). El identificador es el de la persona/cliente. */
    @Transactional
    public void bloquearUsuario(Long personaId) {
        UsuarioEntity usuario = usuarioRepository.findByPersonaId(personaId)
                .orElseThrow(() -> new ResourceNotFoundException("Usuario no encontrado para persona: " + personaId));

        if (!Boolean.TRUE.equals(usuario.getActivo())) {
            throw new ConflictException("El usuario ya estaba bloqueado.");
        }

        usuario.setActivo(false);
        usuarioRepository.save(usuario);
        log.info("[ADMIN] Usuario de la persona {} bloqueado (sin acceso a la app).", personaId);
    }

    private PagoPendienteDto toDto(CompraEntity compra) {
        ClienteEntity cliente = compra.getCliente();
        PersonaEntity persona = cliente != null ? cliente.getPersona() : null;
        String nombre = persona != null ? (persona.getNombre() + " " + persona.getApellido()) : null;
        String documento = persona != null ? persona.getDocumento() : null;

        ProductoEntity producto = compra.getProducto();
        boolean tieneMulta = multaRepository.findByCompraId(compra.getId()).stream()
                .anyMatch(m -> "pendiente".equalsIgnoreCase(m.getEstado()));

        return new PagoPendienteDto(
                compra.getId(),
                cliente != null ? cliente.getId() : null,
                nombre,
                documento,
                producto != null ? producto.getDescripcionCatalogo() : null,
                compra.getImporte(),
                compra.getTotal(),
                compra.getFecha() != null ? compra.getFecha().toString() : null,
                tieneMulta);
    }
}
