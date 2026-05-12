package com.tpo.backend.subasta.repository;

import com.tpo.backend.subasta.entity.RegistroDeSubastaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface RegistroDeSubastaRepository extends JpaRepository<RegistroDeSubastaEntity, Long> {

    List<RegistroDeSubastaEntity> findByCliente(Long cliente);

    List<RegistroDeSubastaEntity> findByDuenio(Long duenio);

    List<RegistroDeSubastaEntity> findBySubasta(Long subasta);
}
