package com.jarr.notifications;

import com.jarr.user.User;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface PushSubscriptionRepository extends JpaRepository<PushSubscription, Long> {
    List<PushSubscription> findAllByUser(User user);
    Optional<PushSubscription> findByEndpoint(String endpoint);
}
