package com.jarr.user.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Size;
import lombok.Data;

/**
 * User update request DTO — all fields optional (PATCH semantics).
 */
@Data
public class UpdateUserRequest {

    @Size(max = 100, message = "Name must be at most 100 characters")
    private String name;

    @Email(message = "Enter a valid email address")
    @Size(max = 150)
    private String email;

    @Size(max = 3, message = "Currency code must be at most 3 characters")
    private String currency;

    @Size(max = 20)
    private String dateFormat;

    @Size(max = 500)
    private String avatarUrl;

    private Boolean notificationEnabled;
}
