package com.jarr.friend;

import com.jarr.friend.dto.FriendDto;
import com.jarr.friend.dto.FriendRequest;
import com.jarr.user.User;
import com.jarr.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FriendService {

    private final FriendRepository friendRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public List<FriendDto> getFriends(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return friendRepository.findAllByUserOrderByNameAsc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FriendDto createFriend(String email, FriendRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        if (friendRepository.existsByUserAndNameIgnoreCase(user, request.getName().trim())) {
            throw new RuntimeException("Friend with this name already exists");
        }

        Friend friend = Friend.builder()
                .user(user)
                .name(request.getName().trim())
                .build();

        return mapToDto(friendRepository.save(friend));
    }

    @Transactional
    public void deleteFriend(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Friend friend = friendRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Friend not found"));

        friendRepository.delete(friend);
    }

    /**
     * Helper method to ensure a friend exists (used when creating a split or debt manually)
     */
    @Transactional
    public void ensureFriendExists(User user, String friendName) {
        if (friendName == null || friendName.trim().isEmpty()) {
            return;
        }
        String trimmedName = friendName.trim();
        if (!friendRepository.existsByUserAndNameIgnoreCase(user, trimmedName)) {
            Friend friend = Friend.builder()
                    .user(user)
                    .name(trimmedName)
                    .build();
            friendRepository.save(friend);
        }
    }

    private FriendDto mapToDto(Friend friend) {
        return FriendDto.builder()
                .id(friend.getId())
                .name(friend.getName())
                .createdAt(friend.getCreatedAt())
                .build();
    }
}
