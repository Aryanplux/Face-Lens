package com.example.demo.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Date;

@Entity
@Table(name = "face_matches")
@Data
@NoArgsConstructor
@AllArgsConstructor
public class FaceMatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "photo_id", nullable = false)
    private Photo photo;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "unique_face_id", nullable = true) // Nullable if not yet assigned or if no group found
    private UniqueFace uniqueFace;

    @Column(name = "bounding_box", length = 500)
    private String boundingBox; // JSON string: {"x": 10, "y": 10, "w": 100, "h": 100}

    private Double confidence;

    @Lob
    @Column(columnDefinition = "TEXT")
    private String embedding; // Stored as Base64 string from Python ML service

    @Temporal(TemporalType.TIMESTAMP)
    @Column(name = "created_at")
    private Date createdAt;

    @PrePersist
    protected void onCreate() {
        createdAt = new Date();
    }
}
