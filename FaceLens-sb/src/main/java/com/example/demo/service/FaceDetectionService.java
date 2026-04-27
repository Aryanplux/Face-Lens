package com.example.demo.service;

import com.example.demo.entity.Photo;
import com.example.demo.repository.PhotoRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.ByteArrayInputStream;
import java.io.IOException;

@Service
public class FaceDetectionService {
    private static final Logger logger = LoggerFactory.getLogger(FaceDetectionService.class);

    @Autowired
    private MlService mlService;

    @Autowired
    private PhotoRepository photoRepository;

    @Async
    public void detectAndSaveFaces(Long photoId, byte[] fileBytes, String originalFilename, String contentType) {
        try {
            MultipartFile multipartFile = new MockMultipartFile(
                    "file",
                    originalFilename,
                    contentType,
                    fileBytes
            );
            String faceData = mlService.getFaceData(multipartFile);
            
            photoRepository.findById(photoId).ifPresent(photo -> {
                photo.setFaceData(faceData);
                photoRepository.save(photo);
                logger.info("Successfully detected faces for photo {}", photoId);
            });
        } catch (Exception e) {
            logger.error("Failed to detect faces for photo {}: {}", photoId, e.getMessage());
        }
    }
}
