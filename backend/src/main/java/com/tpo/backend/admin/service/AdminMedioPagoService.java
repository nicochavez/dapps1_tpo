package com.tpo.backend.admin.service;

import com.tpo.backend.admin.dto.MedioPagoPendienteDto;
import com.tpo.backend.cliente.entity.ClienteEntity;
import com.tpo.backend.common.exception.ConflictException;
import com.tpo.backend.common.exception.ResourceNotFoundException;
import com.tpo.backend.mediospago.entity.ChequeCertificadoEntity;
import com.tpo.backend.mediospago.entity.CuentaBancariaEntity;
import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import com.tpo.backend.mediospago.entity.TarjetaCreditoEntity;
import com.tpo.backend.mediospago.repository.MedioPagoRepository;
import com.tpo.backend.notificacion.service.NotificacionService;
import com.tpo.backend.persona.PersonaEntity;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * Backoffice de medios de pago (solo empleados; ver SecurityConfig {@code /api/v1/admin/**}).
 * Permite listar los medios de pago pendientes de verificacion y habilitarlos. Una vez
 * verificados, el cliente puede usarlos para pujar y pagar.
 */
@Service
public class AdminMedioPagoService {

    private static final Logger log = LoggerFactory.getLogger(AdminMedioPagoService.class);

    private final MedioPagoRepository medioPagoRepository;
    private final NotificacionService notificacionService;

    public AdminMedioPagoService(MedioPagoRepository medioPagoRepository,
                                 NotificacionService notificacionService) {
        this.medioPagoRepository = medioPagoRepository;
        this.notificacionService = notificacionService;
    }

    /** Medios de pago con verificado = false (pendientes de habilitacion). */
    @Transactional(readOnly = true)
    public List<MedioPagoPendienteDto> listarPendientes() {
        return medioPagoRepository.findByVerificadoFalse().stream()
                .map(this::toDto)
                .toList();
    }

    /** Habilita un medio de pago pendiente y notifica al cliente. */
    @Transactional
    public MedioPagoPendienteDto verificar(Long medioPagoId) {
        MedioPagoEntity mp = medioPagoRepository.findById(medioPagoId)
                .orElseThrow(() -> new ResourceNotFoundException("Medio de pago no encontrado: " + medioPagoId));

        if (Boolean.TRUE.equals(mp.getVerificado())) {
            throw new ConflictException("El medio de pago ya estaba verificado.");
        }

        mp.setVerificado(true);
        medioPagoRepository.save(mp);

        ClienteEntity cliente = mp.getCliente();
        if (cliente != null) {
            notificacionService.enviar(cliente.getId(),
                    "Payment method verified",
                    "Your payment method (" + mp.getDetalle() + ") was verified. "
                            + "You can now use it to bid and pay.");
        }

        log.info("[ADMIN] Medio de pago {} verificado (cliente {}).",
                medioPagoId, cliente != null ? cliente.getId() : null);

        return toDto(mp);
    }

    private MedioPagoPendienteDto toDto(MedioPagoEntity mp) {
        ClienteEntity cliente = mp.getCliente();
        PersonaEntity persona = cliente != null ? cliente.getPersona() : null;
        String nombre = persona != null ? (persona.getNombre() + " " + persona.getApellido()) : null;
        String documento = persona != null ? persona.getDocumento() : null;

        return new MedioPagoPendienteDto(
                mp.getId(),
                tipoDe(mp),
                mp.getMoneda(),
                Boolean.TRUE.equals(mp.getInternacional()),
                mp.getDetalle(),
                cliente != null ? cliente.getId() : null,
                nombre,
                documento);
    }

    private String tipoDe(MedioPagoEntity mp) {
        if (mp instanceof CuentaBancariaEntity) return "cuenta_bancaria";
        if (mp instanceof TarjetaCreditoEntity) return "tarjeta_credito";
        if (mp instanceof ChequeCertificadoEntity) return "cheque_certificado";
        return "desconocido";
    }
}
