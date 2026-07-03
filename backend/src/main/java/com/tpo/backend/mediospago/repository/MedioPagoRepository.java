package com.tpo.backend.mediospago.repository;

import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedioPagoRepository extends JpaRepository<MedioPagoEntity, Long> {

    List<MedioPagoEntity> findByClienteId(Long clienteId);

    /** Medios pendientes de verificacion (backoffice de empleados). */
    List<MedioPagoEntity> findByVerificadoFalse();

    /**
     * True si el cliente tiene al menos un medio verificado y vigente en la moneda dada.
     * Si {@code moneda} es null, no filtra por moneda (cualquiera sirve).
     */
    @Query("select count(m) > 0 from MedioPagoEntity m " +
           "where m.cliente.id = :clienteId " +
           "and m.verificado = true and m.vigente = true " +
           "and (:moneda is null or upper(m.moneda) = upper(:moneda))")
    boolean tieneMedioVerificadoEnMoneda(@Param("clienteId") Long clienteId,
                                         @Param("moneda") String moneda);
}
