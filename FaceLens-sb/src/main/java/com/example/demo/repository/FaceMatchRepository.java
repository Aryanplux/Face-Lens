package com.example.demo.repository;

import com.example.demo.entity.FaceMatch;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FaceMatchRepository extends JpaRepository<FaceMatch, Long> {
    List<FaceMatch> findByPhotoId(Long photoId);
    List<FaceMatch> findByUniqueFaceId(Long uniqueFaceId);
}
