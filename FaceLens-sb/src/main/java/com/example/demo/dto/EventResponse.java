package com.example.demo.dto;

import java.util.Date;
import java.util.List;

public class EventResponse {
    private Long id;
    private String name;
    private String description;
    private List<String> photoUrls;
    private Date lastUpdated;

    public EventResponse(Long id, String name, String description, List<String> photoUrls, Date lastUpdated) {
        this.id = id;
        this.name = name;
        this.description = description;
        this.photoUrls = photoUrls;
        this.lastUpdated = lastUpdated;
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

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public List<String> getPhotoUrls() {
        return photoUrls;
    }

    public void setPhotoUrls(List<String> photoUrls) {
        this.photoUrls = photoUrls;
    }

    public Date getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(Date lastUpdated) {
        this.lastUpdated = lastUpdated;
    }
}
