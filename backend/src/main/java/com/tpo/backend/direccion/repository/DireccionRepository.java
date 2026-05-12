package com.tpo.backend.direccion.repository;

import com.tpo.backend.direccion.entity.DireccionEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface DireccionRepository extends JpaRepository<DireccionEntity, Long> {

    List<DireccionEntity> findByCliente(Long cliente);

    Optional<DireccionEntity> findByClienteAndFavoritoTrue(Long cliente);
}
