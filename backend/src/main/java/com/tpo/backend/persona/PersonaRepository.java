package com.tpo.backend.persona;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface PersonaRepository extends JpaRepository<PersonaEntity, Long> {
    
    // Handy custom method to prevent duplicate documents
    boolean existsByDocumento(String documento);
}