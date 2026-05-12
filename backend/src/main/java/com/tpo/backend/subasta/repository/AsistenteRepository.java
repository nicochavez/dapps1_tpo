package com.tpo.backend.subasta.repository;

import com.tpo.backend.subasta.entity.AsistenteEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface AsistenteRepository extends JpaRepository<AsistenteEntity, Long> {

    Optional<AsistenteEntity> findBySubastaAndCliente(Long subasta, Long cliente);

    List<AsistenteEntity> findBySubasta(Long subasta);

    List<AsistenteEntity> findByCliente(Long cliente);

    long countBySubasta(Long subasta);
}
