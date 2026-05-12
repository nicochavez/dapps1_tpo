package com.tpo.backend.mediospago.repository;

import com.tpo.backend.mediospago.entity.MedioPagoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface MedioPagoRepository extends JpaRepository<MedioPagoEntity, Long> {

    List<MedioPagoEntity> findByCliente(Long cliente);
}
