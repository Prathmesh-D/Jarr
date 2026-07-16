package com.jarr.friend;

import com.jarr.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface FriendRepository extends JpaRepository<Friend, Long> {
    List<Friend> findAllByUserOrderByNameAsc(User user);
    Optional<Friend> findByIdAndUser(Long id, User user);
    Optional<Friend> findByUserAndNameIgnoreCase(User user, String name);
    boolean existsByUserAndNameIgnoreCase(User user, String name);
}
