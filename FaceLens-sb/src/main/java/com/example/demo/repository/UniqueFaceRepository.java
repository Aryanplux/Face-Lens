package com.example.demo.repository;

import com.example.demo.entity.UniqueFace;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface UniqueFaceRepository extends JpaRepository<UniqueFace, Long> {
    List<UniqueFace> findByUserId(Long userId);
}
