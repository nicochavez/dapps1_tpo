package com.tpo.backend.common.ws;

import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

/**
 * Publica eventos de subasta a los clientes suscritos via WebSocket/STOMP (RF-25).
 */
@Component
public class SubastaEventPublisher {

    private final SimpMessagingTemplate messagingTemplate;

    public SubastaEventPublisher(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    public void publish(Long subastaId, String tipo, Object payload) {
        messagingTemplate.convertAndSend(
                "/topic/subastas/" + subastaId,
                new SubastaEventDto(tipo, subastaId, payload));
    }
}
