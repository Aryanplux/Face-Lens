package com.example.demo.controller;

import com.example.demo.dto.CreateEventRequest;
import com.example.demo.dto.EventLoginRequest;
import com.example.demo.dto.EventResponse;
import com.example.demo.entity.Event;
import com.example.demo.entity.Photo;
import com.example.demo.repository.EventRepository;
import com.example.demo.service.EventService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/events")
@CrossOrigin(origins = { "http://localhost:5173", "http://localhost:5174", "http://localhost:5175", "http://localhost:3000" })
public class EventController {

    @Autowired
    private EventService eventService;

    @Autowired
    private EventRepository eventRepository;

    @PostMapping
    public ResponseEntity<?> createEvent(@RequestBody CreateEventRequest createEventRequest) {
        Event event = eventService.createEvent(createEventRequest);
        return ResponseEntity.ok(event);
    }

    @PostMapping("/login")
    public ResponseEntity<?> loginToEvent(@RequestBody EventLoginRequest eventLoginRequest) {
        Event event = eventService.login(eventLoginRequest.getName(), eventLoginRequest.getPassword());

        List<String> photoUrls = event.getPhotos().stream()
                .map(photo -> ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/photos/")
                        .path(photo.getId().toString())
                        .toUriString())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new EventResponse(event.getId(), event.getName(), photoUrls));
    }

    @GetMapping("/{eventName}")
    public ResponseEntity<?> getEvent(@PathVariable String eventName) {
        Event event = eventRepository.findByName(eventName)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        List<String> photoUrls = event.getPhotos().stream()
                .map(photo -> ServletUriComponentsBuilder.fromCurrentContextPath()
                        .path("/api/photos/")
                        .path(photo.getId().toString())
                        .toUriString())
                .collect(Collectors.toList());

        return ResponseEntity.ok(new EventResponse(event.getId(), event.getName(), photoUrls));
    }
}
