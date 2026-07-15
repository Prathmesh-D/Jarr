package com.jarr.notifications;

import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

import java.util.Map;

@RestController
@RequestMapping("/api/v1/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationService notificationService;

    @GetMapping("/vapidPublicKey")
    public ResponseEntity<Map<String, String>> getPublicKey() {
        return ResponseEntity.ok(Map.of("publicKey", notificationService.getPublicKey()));
    }

    @PostMapping("/subscribe")
    public ResponseEntity<Void> subscribe(Authentication authentication, @Valid @RequestBody PushSubscriptionRequest request) {
        notificationService.subscribe(authentication.getName(), request);
        return ResponseEntity.ok().build();
    }
}
