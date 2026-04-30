package com.example.demo.controller;

import com.example.demo.entity.Event;
import com.example.demo.entity.Photo;
import com.example.demo.entity.User;
import com.example.demo.repository.PhotoRepository;
import com.example.demo.repository.UserRepository;
import com.example.demo.security.JwtTokenProvider;
import com.example.demo.service.PhotoStorageService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.Resource;
import org.springframework.core.io.UrlResource;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.io.ByteArrayInputStream;
import java.io.IOException;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Date;
import java.util.List;
import java.util.Map;
import java.util.HashMap;
import java.util.Optional;
import java.util.zip.ZipEntry;
import java.util.zip.ZipInputStream;
import com.example.demo.service.FaceDetectionService;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.JsonNode;
import com.example.demo.service.MlService;

@RestController
@RequestMapping("/api/photos")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175" })
public class PhotoController {

    @Autowired
    private PhotoRepository photoRepository;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private JwtTokenProvider jwtTokenProvider;

    @Autowired
    private PhotoStorageService photoStorageService;

    @Autowired
    private FaceDetectionService faceDetectionService;

    @Autowired
    private MlService mlService;

    @Value("${app.upload.dir}")
    private String baseUploadDir;

    private User getAuthenticatedUser(String authHeader) {
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            return null;
        }
        String token = authHeader.substring(7);
        if (!jwtTokenProvider.validateToken(token)) {
            return null;
        }
        String username = jwtTokenProvider.getUsernameFromToken(token);
        Optional<User> userOptional = userRepository.findByUsername(username);
        return userOptional.orElse(null);
    }

    @PostMapping("/upload")
    public ResponseEntity<?> uploadPhotos(@RequestHeader("Authorization") String authHeader,
            @RequestParam("files") MultipartFile[] files,
            @RequestParam("eventId") Long eventId) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }

        List<Photo> savedPhotos = new ArrayList<>();

        for (MultipartFile file : files) {
            try {
                PhotoStorageService.StorageResult result = photoStorageService.storePhoto(file, user.getId(), eventId);

                Photo photo = new Photo();
                photo.setFilename(file.getOriginalFilename());
                photo.setFilePath(result.filePath);
                photo.setThumbnailPath(result.thumbnailPath);
                photo.setUser(user);
                photo.setStatus("PENDING");
                photo.setUploadedAt(new Date());
                
                Event event = new Event();
                event.setId(eventId);
                photo.setEvent(event);

                Photo savedPhoto = photoRepository.save(photo);
                savedPhotos.add(savedPhoto);

                // Trigger async ML face detection
                faceDetectionService.detectAndSaveFaces(
                    savedPhoto.getId(), 
                    file.getBytes(), 
                    file.getOriginalFilename(), 
                    file.getContentType()
                );
            } catch (IOException e) {
                return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                        .body("Failed to store file " + file.getOriginalFilename() + ": " + e.getMessage());
            }
        }

        return ResponseEntity.ok(savedPhotos);
    }

    @PostMapping("/upload-zip")
    public ResponseEntity<?> uploadZipPhotos(@RequestHeader("Authorization") String authHeader,
            @RequestParam("file") MultipartFile zipFile,
            @RequestParam("eventId") Long eventId) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }

        if (zipFile.isEmpty() || !zipFile.getOriginalFilename().toLowerCase().endsWith(".zip")) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body("Please upload a valid zip file");
        }

        List<Photo> savedPhotos = new ArrayList<>();
        try (ZipInputStream zis = new ZipInputStream(zipFile.getInputStream())) {
            ZipEntry zipEntry = zis.getNextEntry();
            while (zipEntry != null) {
                if (!zipEntry.isDirectory() && (zipEntry.getName().toLowerCase().endsWith(".jpg") ||
                        zipEntry.getName().toLowerCase().endsWith(".jpeg") ||
                        zipEntry.getName().toLowerCase().endsWith(".png"))) {

                    // Use the overloaded storePhoto that takes an InputStream
                    byte[] bytes = zis.readAllBytes();
                    ByteArrayInputStream bais = new ByteArrayInputStream(bytes);

                    PhotoStorageService.StorageResult result = photoStorageService.storePhoto(bais, zipEntry.getName(),
                            user.getId(), eventId);
                    Photo photo = new Photo();
                    photo.setFilename(zipEntry.getName());
                    photo.setFilePath(result.filePath);
                    photo.setThumbnailPath(result.thumbnailPath);
                    photo.setUser(user);
                    photo.setStatus("PENDING");
                    photo.setUploadedAt(new Date());

                    Event event = new Event();
                    event.setId(eventId);
                    photo.setEvent(event);

                    Photo savedPhoto = photoRepository.save(photo);
                    savedPhotos.add(savedPhoto);

                    // Trigger async ML face detection
                    faceDetectionService.detectAndSaveFaces(
                        savedPhoto.getId(), 
                        bytes, 
                        zipEntry.getName(), 
                        "image/jpeg"
                    );
                }
                zipEntry = zis.getNextEntry();
            }
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Failed to process zip file: " + e.getMessage());
        }

        return ResponseEntity.ok(savedPhotos);
    }

    @GetMapping
    public ResponseEntity<?> getUserPhotos(@RequestHeader("Authorization") String authHeader) {
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Invalid or missing token");
        }

        List<Photo> photos = photoRepository.findByUserId(user.getId());
        return ResponseEntity.ok(photos);
    }

    @GetMapping("/{id}/thumbnail")
    public ResponseEntity<Resource> getPhotoThumbnail(@RequestHeader("Authorization") String authHeader,
            @PathVariable Long id) {
        // Simple security check optional if tokens are sent in header, but for image
        // src, usually token is handled differently or passed via query.
        // Assuming client attaches header for this call (e.g. via fetch API).
        User user = getAuthenticatedUser(authHeader);
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Photo> photoOpt = photoRepository.findById(id);
        if (photoOpt.isEmpty() || !photoOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            Path file = Paths.get(baseUploadDir).resolve(photoOpt.get().getThumbnailPath());
            Resource resource = new UrlResource(file.toUri());

            if (resource.exists() || resource.isReadable()) {
                return ResponseEntity.ok()
                        .header(HttpHeaders.CONTENT_DISPOSITION,
                                "attachment; filename=\"" + resource.getFilename() + "\"")
                        .contentType(MediaType.IMAGE_JPEG)
                        .body(resource);
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<?> deletePhoto(@RequestHeader("Authorization") String authHeader, @PathVariable Long id) {
        User user = getAuthenticatedUser(authHeader);
        
        if (user == null) {
            return ResponseEntity.status(HttpStatus.UNAUTHORIZED).build();
        }

        Optional<Photo> photoOpt = photoRepository.findById(id);
        if (photoOpt.isEmpty() || !photoOpt.get().getUser().getId().equals(user.getId())) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }
        
        Photo photo = photoOpt.get();
        photoStorageService.deleteFileByRelativePath(photo.getFilePath());
        photoStorageService.deleteFileByRelativePath(photo.getThumbnailPath());
        
        photoRepository.delete(photoOpt.get());
        return ResponseEntity.ok().build();
    }

    @PostMapping("/search-face")
    public ResponseEntity<?> searchByFace(
            @RequestParam(required = false) String authHeader, // Auth could be optional for public galleries
            @RequestParam("file") MultipartFile file,
            @RequestParam("eventId") Long eventId) {
            
        try {
            // 1. Get embedding for the uploaded target face
            String targetFaceDataRaw = mlService.getFaceData(file);
            ObjectMapper mapper = new ObjectMapper();
            JsonNode targetJson = mapper.readTree(targetFaceDataRaw);
            JsonNode targetFaces = targetJson.get("faces");
            
            if (targetFaces == null || !targetFaces.isArray() || targetFaces.isEmpty()) {
                return ResponseEntity.badRequest().body("No faces detected in the uploaded image");
            }
            
            // Assume the largest/most prominent face is the target
            String targetEmbedding = targetFaces.get(0).get("embedding").asText();
            
            // 2. Fetch all photos for this event that have faceData
            List<Photo> eventPhotos = photoRepository.findByEventId(eventId);
            System.out.println("[DIAGNOSTICS] Found " + eventPhotos.size() + " total photos for eventId " + eventId);
            
            List<String> galleryEmbeddings = new ArrayList<>();
            List<Photo> galleryPhotos = new ArrayList<>(); // Keep track of which embedding belongs to which photo
            
            for (Photo photo : eventPhotos) {
                if (photo.getFaceData() != null) {
                    try {
                        JsonNode photoData = mapper.readTree(photo.getFaceData());
                        JsonNode facesInPhoto = photoData.get("faces");
                        if (facesInPhoto != null && facesInPhoto.isArray()) {
                            for (JsonNode faceInPhoto : facesInPhoto) {
                                galleryEmbeddings.add(faceInPhoto.get("embedding").asText());
                                galleryPhotos.add(photo); // One photo might have multiple faces, so it could appear multiple times here
                            }
                        }
                    } catch (Exception e) {// ignore parsing error for individual photo
                    } 
                } else {
                    System.out.println("[DIAGNOSTICS] Photo ID " + photo.getId() + " has null faceData");
                }
            }
            
            System.out.println("[DIAGNOSTICS] Total gallery embeddings extracted: " + galleryEmbeddings.size());
            
            if (galleryEmbeddings.isEmpty()) {
                Map<String, Object> emptyResp = new HashMap<>();
                emptyResp.put("matchedPhotos", new ArrayList<>());
                emptyResp.put("closest_match_distance", null);
                return ResponseEntity.ok(emptyResp);
            }
            
            // 3. Call ML service to bulk compare
            Map<String, Object> compareDetails = mlService.bulkCompareWithDetails(targetEmbedding, galleryEmbeddings);
            List<Integer> matchIndices = (List<Integer>) compareDetails.get("indices");
            
            // 4. Map match indices back to Photos (and eliminate duplicates if a photo had multiple matching faces somehow, though unlikely)
            List<Photo> matchedPhotos = new ArrayList<>();
            for (Integer index : matchIndices) {
                Photo matchedPhoto = galleryPhotos.get(index);
                if (!matchedPhotos.contains(matchedPhoto)) {
                    matchedPhotos.add(matchedPhoto);
                }
            }
            
            Map<String, Object> responseBody = new HashMap<>();
            responseBody.put("matchedPhotos", matchedPhotos);
            responseBody.put("closest_match_distance", compareDetails.get("closest_match_distance"));
            
            return ResponseEntity.ok(responseBody);
            
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body("Error processing face search: " + e.getMessage());
        }
    }

    @PostMapping("/reprocess-all")
    public ResponseEntity<?> reprocessAllPhotos() {
        List<Photo> allPhotos = photoRepository.findAll();
        int count = 0;
        for (Photo photo : allPhotos) {
            if (photo.getFaceData() == null) {
                try {
                    Path filePath = Paths.get(baseUploadDir).resolve(photo.getFilePath());
                    byte[] fileBytes = java.nio.file.Files.readAllBytes(filePath);
                    faceDetectionService.detectAndSaveFaces(
                            photo.getId(), 
                            fileBytes, 
                            photo.getFilename(), 
                            "image/jpeg"
                    );
                    count++;
                } catch (Exception e) {
                    System.out.println("Failed to reprocess photo " + photo.getId() + ": " + e.getMessage());
                }
            }
        }
        return ResponseEntity.ok("Reprocessed " + count + " photos that were missing face data.");
    }
}
