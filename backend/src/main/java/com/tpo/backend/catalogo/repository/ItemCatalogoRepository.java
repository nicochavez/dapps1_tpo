package com.tpo.backend.catalogo.repository;

import com.tpo.backend.catalogo.entity.ItemCatalogoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ItemCatalogoRepository extends JpaRepository<ItemCatalogoEntity, Long> {

    List<ItemCatalogoEntity> findByCatalogo(Long catalogo);

    Optional<ItemCatalogoEntity> findByProducto(Long producto);
}
