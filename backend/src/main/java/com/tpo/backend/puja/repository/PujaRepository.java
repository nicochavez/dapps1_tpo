package com.tpo.backend.puja.repository;

import com.tpo.backend.puja.entity.PujaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PujaRepository extends JpaRepository<PujaEntity, Long> {

    List<PujaEntity> findByItemIdOrderByImporteDesc(Long itemId);

    List<PujaEntity> findByItemIdOrderByFechaAsc(Long itemId);

    List<PujaEntity> findByAsistenteId(Long asistenteId);

    Optional<PujaEntity> findFirstByItemIdOrderByImporteDesc(Long itemId);
}
