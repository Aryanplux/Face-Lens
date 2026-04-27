package com.example.demo.service;

import com.fasterxml.jackson.core.JsonProcessingException;
import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.core.io.ByteArrayResource;
import org.springframework.core.io.Resource;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.util.LinkedMultiValueMap;
import org.springframework.util.MultiValueMap;
import org.springframework.web.client.RestTemplate;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

@Service
public class MlService {

    @Value("${ml.service.url:http://localhost:8000}")
    private String mlServiceUrl;

    private final RestTemplate restTemplate = new RestTemplate();
    private final ObjectMapper objectMapper = new ObjectMapper();

    public String getFaceData(MultipartFile file) throws IOException {
        String url = mlServiceUrl + "/detect";

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.MULTIPART_FORM_DATA);

        MultiValueMap<String, Object> body = new LinkedMultiValueMap<>();
        // Wrap the standard MultipartFile directly in a Resource
        Resource resource = new ByteArrayResource(file.getBytes()) {
            @Override
            public String getFilename() {
                return file.getOriginalFilename() != null ? file.getOriginalFilename() : "image.jpg";
            }
        };
        body.add("file", resource);

        HttpEntity<MultiValueMap<String, Object>> requestEntity = new HttpEntity<>(body, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        if (response.getStatusCode().is2xxSuccessful()) {
            return response.getBody(); // Returns the JSON string containing face arrays
        } else {
            throw new IOException("Failed to detect faces: " + response.getStatusCode());
        }
    }

    public List<Integer> bulkCompare(String targetEmbeddingBase64, List<String> galleryEmbeddings) throws IOException {
        String url = mlServiceUrl + "/bulk_compare";

        Map<String, Object> requestMap = new HashMap<>();
        requestMap.put("target_embedding", targetEmbeddingBase64);
        requestMap.put("gallery_embeddings", galleryEmbeddings);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> requestEntity = new HttpEntity<>(requestMap, headers);

        ResponseEntity<String> response = restTemplate.postForEntity(url, requestEntity, String.class);
        if (response.getStatusCode().is2xxSuccessful()) {
            try {
                JsonNode root = objectMapper.readTree(response.getBody());
                JsonNode matches = root.get("matches");
                List<Integer> matchedIndices = new ArrayList<>();
                if (matches != null && matches.isArray()) {
                    for (JsonNode match : matches) {
                        if (match.get("is_match").asBoolean()) {
                            matchedIndices.add(match.get("index").asInt());
                        }
                    }
                }
                return matchedIndices;
            } catch (JsonProcessingException e) {
                throw new IOException("Failed to parse ML response", e);
            }
        } else {
            throw new IOException("Failed to compare faces: " + response.getStatusCode());
        }
    }
}
