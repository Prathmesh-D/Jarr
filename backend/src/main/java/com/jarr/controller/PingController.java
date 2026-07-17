package com.jarr.controller;

import com.jarr.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/ping")
@RequiredArgsConstructor
public class PingController {

    private final UserRepository userRepository;

    @GetMapping
    public ResponseEntity<Map<String, Object>> pingDatabase() {
        // Execute a fast, lightweight query to ensure the database stays awake
        long count = userRepository.count();
        
        return ResponseEntity.ok(Map.of(
            "status", "UP",
            "message", "Database pinged successfully",
            "dbActivity", count >= 0
        ));
    }
}
