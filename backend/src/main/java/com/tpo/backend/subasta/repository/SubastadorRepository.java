package com.tpo.backend.subasta.repository;

import com.tpo.backend.subasta.entity.SubastadorEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SubastadorRepository extends JpaRepository<SubastadorEntity, Long> {
}
