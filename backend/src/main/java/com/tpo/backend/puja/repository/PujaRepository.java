package com.tpo.backend.puja.repository;

import com.tpo.backend.puja.entity.PujaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PujaRepository extends JpaRepository<PujaEntity, Long> {

    List<PujaEntity> findByItemIdOrderByImporteDesc(Long itemId);

    List<PujaEntity> findByItemIdOrderByFechaAsc(Long itemId);

    List<PujaEntity> findByAsistenteId(Long asistenteId);

    Optional<PujaEntity> findFirstByItemIdOrderByImporteDesc(Long itemId);

    Optional<PujaEntity> findByIdempotencyKey(String idempotencyKey);

    /** Cantidad de items distintos en los que el cliente ha pujado (= "Attended"). */
    @Query("SELECT COUNT(DISTINCT p.item.id) FROM PujaEntity p WHERE p.asistente.cliente.id = :clienteId")
    long countDistinctItemsByClienteId(@Param("clienteId") Long clienteId);
}
