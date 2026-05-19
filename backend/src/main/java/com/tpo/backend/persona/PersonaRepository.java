package com.tpo.backend.persona;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface PersonaRepository extends JpaRepository<PersonaEntity, Long> {
    boolean existsByDocumento(String documento);

    Optional<PersonaEntity> findByDocumento(String documento);
}