package com.jarr.friend;

import com.jarr.friend.dto.FriendDto;
import com.jarr.friend.dto.FriendRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/friends")
@RequiredArgsConstructor
public class FriendController {

    private final FriendService friendService;

    @GetMapping
    public ResponseEntity<List<FriendDto>> getFriends(Authentication authentication) {
        return ResponseEntity.ok(friendService.getFriends(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<FriendDto> createFriend(
            Authentication authentication,
            @Valid @RequestBody FriendRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(friendService.createFriend(authentication.getName(), request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteFriend(
            Authentication authentication,
            @PathVariable Long id) {
        friendService.deleteFriend(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
