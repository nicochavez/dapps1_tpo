package com.tpo.backend.notificacion.repository;

import com.tpo.backend.notificacion.entity.NotificacionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificacionRepository extends JpaRepository<NotificacionEntity, Long> {

    List<NotificacionEntity> findByClienteOrderByFechaCreacionDesc(Long cliente);
}
