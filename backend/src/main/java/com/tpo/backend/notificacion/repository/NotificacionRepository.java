package com.tpo.backend.notificacion.repository;

import com.tpo.backend.notificacion.entity.NotificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {

    List<NotificacionEntity> findByClienteIdOrderByFechaCreacionDesc(Long clienteId);

    Optional<NotificacionEntity> findByIdAndClienteId(Long id, Long clienteId);
}
