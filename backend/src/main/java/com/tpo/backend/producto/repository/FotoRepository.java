package com.tpo.backend.producto.repository;

import com.tpo.backend.producto.entity.FotoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FotoRepository extends JpaRepository<FotoEntity, Long> {

    List<FotoEntity> findByProducto(Long producto);
}
