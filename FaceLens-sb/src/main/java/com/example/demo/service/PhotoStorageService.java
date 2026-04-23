package com.example.demo.service;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import javax.imageio.ImageIO;
import java.awt.*;
import java.awt.image.BufferedImage;
import java.io.File;
import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.UUID;

@Service
public class PhotoStorageService {

    @Value("${app.upload.dir}")
    private String baseUploadDir;

    public static class StorageResult {
        public String filePath;
        public String thumbnailPath;
        
        public StorageResult(String filePath, String thumbnailPath) {
            this.filePath = filePath;
            this.thumbnailPath = thumbnailPath;
        }
    }

    public StorageResult storePhoto(MultipartFile file, Long userId, Long eventId) throws IOException {
        return storePhoto(file.getInputStream(), file.getOriginalFilename(), userId, eventId);
    }

    public StorageResult storePhoto(java.io.InputStream inputStream, String originalFilename, Long userId, Long eventId) throws IOException {
        if (originalFilename == null) {
            originalFilename = "unknown.jpg";
        }

        
        // Generate a unique filename
        String extension = "";
        int dotIndex = originalFilename.lastIndexOf('.');
        if (dotIndex > 0) {
            extension = originalFilename.substring(dotIndex);
        }
        String uniqueFilename = UUID.randomUUID().toString() + extension;

        // User directory: uploads/{userId}/{eventId}/photos
        Path userEventPhotosDir = Paths.get(baseUploadDir, String.valueOf(userId), String.valueOf(eventId), "photos");
        Files.createDirectories(userEventPhotosDir);
        
        Path targetPath = userEventPhotosDir.resolve(uniqueFilename);
        Files.copy(inputStream, targetPath, StandardCopyOption.REPLACE_EXISTING);

        // Generate thumbnail
        String thumbFilename = "thumb_" + uniqueFilename;
        Path thumbPath = userEventPhotosDir.resolve(thumbFilename);
        generateThumbnail(targetPath.toFile(), thumbPath.toFile(), 200);

        // Return relative paths to save in DB
        String relativeFilePath = Paths.get(String.valueOf(userId), String.valueOf(eventId), "photos", uniqueFilename).toString().replace("\\", "/");
        String relativeThumbPath = Paths.get(String.valueOf(userId), String.valueOf(eventId), "photos", thumbFilename).toString().replace("\\", "/");

        return new StorageResult(relativeFilePath, relativeThumbPath);
    }
    
    public void deleteFileByRelativePath(String relativePath) {
        if (relativePath == null) return;
        Path fullPath = Paths.get(baseUploadDir, relativePath);
        try {
            Files.deleteIfExists(fullPath);
        } catch (IOException e) {
            System.err.println("Could not delete file: " + fullPath);
        }
    }

    private void generateThumbnail(File source, File destination, int size) throws IOException {
        BufferedImage originalImage = ImageIO.read(source);
        if (originalImage == null) {
             throw new IOException("Could not read image file");
        }
        
        int originalWidth = originalImage.getWidth();
        int originalHeight = originalImage.getHeight();
        
        int boundWidth = size;
        int boundHeight = size;
        int newWidth = originalWidth;
        int newHeight = originalHeight;
        
        // Calculate new dimensions preserving aspect ratio
        if (originalWidth > boundWidth) {
            newWidth = boundWidth;
            newHeight = (newWidth * originalHeight) / originalWidth;
        }
        if (newHeight > boundHeight) {
            newHeight = boundHeight;
            newWidth = (newHeight * originalWidth) / originalHeight;
        }
        
        BufferedImage resizedImage = new BufferedImage(newWidth, newHeight, BufferedImage.TYPE_INT_RGB);
        Graphics2D g = resizedImage.createGraphics();
        
        // Quality hints
        g.setRenderingHint(RenderingHints.KEY_INTERPOLATION, RenderingHints.VALUE_INTERPOLATION_BILINEAR);
        g.setRenderingHint(RenderingHints.KEY_RENDERING, RenderingHints.VALUE_RENDER_QUALITY);
        g.setRenderingHint(RenderingHints.KEY_ANTIALIASING, RenderingHints.VALUE_ANTIALIAS_ON);
        
        g.drawImage(originalImage, 0, 0, newWidth, newHeight, null);
        g.dispose();
        
        String format = "jpg";
        if (destination.getName().toLowerCase().endsWith(".png")) {
            format = "png";
        }
        
        ImageIO.write(resizedImage, format, destination);
    }
}
