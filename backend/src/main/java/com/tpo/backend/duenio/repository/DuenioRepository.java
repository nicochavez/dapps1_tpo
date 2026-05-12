package com.tpo.backend.duenio.repository;

import com.tpo.backend.duenio.entity.DuenioEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface DuenioRepository extends JpaRepository<DuenioEntity, Long> {
}
