package com.jarr.notifications;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class PushSubscriptionRequest {
    @NotBlank
    private String endpoint;
    
    private Keys keys;

    @Data
    public static class Keys {
        @NotBlank
        private String p256dh;
        
        @NotBlank
        private String auth;
    }
}
