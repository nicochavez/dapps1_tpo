package com.tpo.backend.producto.repository;

import com.tpo.backend.producto.entity.ProductoEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProductoRepository extends JpaRepository<ProductoEntity, Long> {

    Page<ProductoEntity> findByDisponible(Boolean disponible, Pageable pageable);

    List<ProductoEntity> findByDuenio(Long duenio);
}
