package com.example.demo.repository;

import com.example.demo.entity.ProcessingJob;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ProcessingJobRepository extends JpaRepository<ProcessingJob, Long> {
    List<ProcessingJob> findByUserId(Long userId);
    List<ProcessingJob> findByUserIdOrderByCreatedAtDesc(Long userId);
}
