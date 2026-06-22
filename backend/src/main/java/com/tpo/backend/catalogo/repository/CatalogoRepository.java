package com.tpo.backend.catalogo.repository;

import com.tpo.backend.catalogo.entity.CatalogoEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CatalogoRepository extends JpaRepository<CatalogoEntity, Long> {
}
