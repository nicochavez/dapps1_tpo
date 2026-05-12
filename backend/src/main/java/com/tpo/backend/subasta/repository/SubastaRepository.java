package com.tpo.backend.subasta.repository;

import com.tpo.backend.subasta.entity.SubastaEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SubastaRepository extends JpaRepository<SubastaEntity, Long> {

    List<SubastaEntity> findByEstado(String estado);

    List<SubastaEntity> findByCategoria(String categoria);

    List<SubastaEntity> findByFecha(LocalDate fecha);

    List<SubastaEntity> findByEstadoAndCategoria(String estado, String categoria);
}
