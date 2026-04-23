package com.example.demo.dto;

import java.util.List;

public class EventResponse {
    private Long id;
    private String name;
    private List<String> photoUrls;

    public EventResponse(Long id, String name, List<String> photoUrls) {
        this.id = id;
        this.name = name;
        this.photoUrls = photoUrls;
    }

    // Getters and setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls = photoUrls;
    }
}
