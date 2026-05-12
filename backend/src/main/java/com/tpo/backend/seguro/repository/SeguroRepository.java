package com.tpo.backend.seguro.repository;

import com.tpo.backend.seguro.entity.SeguroEntity;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface SeguroRepository extends JpaRepository<SeguroEntity, String> {
}
