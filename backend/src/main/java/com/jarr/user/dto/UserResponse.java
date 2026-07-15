package com.jarr.user.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * User response DTO — never exposes passwordHash.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class UserResponse {
    private Long id;
    private String name;
    private String email;
    private String currency;
    private String dateFormat;
    private String avatarUrl;
    private boolean notificationEnabled;
}
