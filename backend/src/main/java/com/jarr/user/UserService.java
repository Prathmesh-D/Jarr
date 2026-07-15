package com.jarr.user;

import com.jarr.common.exception.ResourceNotFoundException;
import com.jarr.user.dto.UpdateUserRequest;
import com.jarr.user.dto.UserResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * User service — profile management per TRD Section 3 (user module).
 */
@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    /**
     * Get the currently authenticated user from the SecurityContext.
     */
    public User getCurrentUser() {
        Object principal = SecurityContextHolder.getContext().getAuthentication().getPrincipal();
        if (principal instanceof String email) {
            return userRepository.findByEmail(email)
                    .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        } else if (principal instanceof User user) {
            return user;
        }
        throw new ResourceNotFoundException("User not found in security context");
    }

    public UserResponse getCurrentUserResponse() {
        return toResponse(getCurrentUser());
    }

    @Transactional
    public UserResponse updateCurrentUser(UpdateUserRequest request) {
        User user = getCurrentUser();
        // Re-fetch to get managed entity
        user = userRepository.findById(user.getId())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (request.getName() != null) user.setName(request.getName());
        if (request.getEmail() != null) user.setEmail(request.getEmail());
        if (request.getCurrency() != null) user.setCurrency(request.getCurrency());
        if (request.getDateFormat() != null) user.setDateFormat(request.getDateFormat());
        if (request.getAvatarUrl() != null) user.setAvatarUrl(request.getAvatarUrl());
        if (request.getNotificationEnabled() != null) user.setNotificationEnabled(request.getNotificationEnabled());

        user = userRepository.save(user);
        return toResponse(user);
    }

    @Transactional
    public void deleteCurrentUser() {
        User user = getCurrentUser();
        userRepository.deleteById(user.getId());
    }

    private UserResponse toResponse(User user) {
        return UserResponse.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .currency(user.getCurrency())
                .dateFormat(user.getDateFormat())
                .avatarUrl(user.getAvatarUrl())
                .notificationEnabled(user.isNotificationEnabled())
                .build();
    }
}
