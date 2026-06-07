package com.tpo.backend.subasta.service;

import com.tpo.backend.subasta.entity.SubastaEntity;
import com.tpo.backend.subasta.repository.SubastaRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Service;

import java.util.List;

/**
 * Cierre automatico por tiempo de los items en curso (RF-25 / RF-35..39).
 * Cada pocos segundos abre la ventana del item actual de cada subasta abierta
 * y la cierra cuando expira sin nuevas pujas.
 */
@Service
public class SubastaSchedulerService {

    private static final Logger log = LoggerFactory.getLogger(SubastaSchedulerService.class);

    private final SubastaRepository subastaRepository;
    private final AdjudicacionService adjudicacionService;

    public SubastaSchedulerService(SubastaRepository subastaRepository,
                                   AdjudicacionService adjudicacionService) {
        this.subastaRepository = subastaRepository;
        this.adjudicacionService = adjudicacionService;
    }

    @Scheduled(fixedDelay = 5000)
    public void procesarSubastasAbiertas() {
        List<SubastaEntity> abiertas = subastaRepository.findByEstado("abierta");
        for (SubastaEntity subasta : abiertas) {
            try {
                adjudicacionService.procesarSubasta(subasta.getId());
            } catch (RuntimeException e) {
                log.error("Error procesando subasta {}: {}", subasta.getId(), e.getMessage(), e);
            }
        }
    }
}
