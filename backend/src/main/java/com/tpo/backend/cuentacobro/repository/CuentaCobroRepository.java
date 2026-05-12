package com.tpo.backend.cuentacobro.repository;

import com.tpo.backend.cuentacobro.entity.CuentaCobroEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface CuentaCobroRepository extends JpaRepository<CuentaCobroEntity, Long> {

    List<CuentaCobroEntity> findByCliente(Long cliente);
}
