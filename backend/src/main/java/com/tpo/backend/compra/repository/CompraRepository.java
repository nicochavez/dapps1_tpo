package com.tpo.backend.compra.repository;

import com.tpo.backend.compra.entity.CompraEntity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CompraRepository extends JpaRepository<CompraEntity, Long> {

    Page<CompraEntity> findByCliente(Long cliente, Pageable pageable);
}
