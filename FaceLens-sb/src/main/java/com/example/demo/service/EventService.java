package com.example.demo.service;

import com.example.demo.dto.CreateEventRequest;
import com.example.demo.entity.Event;
import com.example.demo.repository.EventRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class EventService {

    @Autowired
    private EventRepository eventRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    public Event createEvent(CreateEventRequest createEventRequest) {
        Event event = new Event();
        event.setName(createEventRequest.getName());
        event.setPassword(passwordEncoder.encode(createEventRequest.getPassword()));
        return eventRepository.save(event);
    }

    public Event login(String name, String password) {
        Event event = eventRepository.findByName(name)
                .orElseThrow(() -> new RuntimeException("Event not found"));

        if (!passwordEncoder.matches(password, event.getPassword())) {
            throw new BadCredentialsException("Invalid password");
        }

        return event;
    }
}
