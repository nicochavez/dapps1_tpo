package com.tpo.backend.multa.repository;

import com.tpo.backend.multa.entity.MultaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MultaRepository extends JpaRepository<MultaEntity, Long> {

    List<MultaEntity> findByClienteIdAndEstado(Long clienteId, String estado);

    List<MultaEntity> findByClienteId(Long clienteId);
}
