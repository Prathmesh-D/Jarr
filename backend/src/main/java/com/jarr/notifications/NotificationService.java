package com.jarr.notifications;

import com.jarr.user.User;
import com.jarr.user.UserRepository;
import jakarta.annotation.PostConstruct;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import nl.martijndwars.webpush.Notification;
import nl.martijndwars.webpush.PushService;
import nl.martijndwars.webpush.Subscription;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.security.Security;
import java.util.List;

@Slf4j
@Service
@RequiredArgsConstructor
public class NotificationService {

    private final PushSubscriptionRepository subscriptionRepository;
    private final UserRepository userRepository;

    private static final String PUBLIC_KEY = "BLdnRzNY_aUYelXMFj1Y-LARAI868utmFDXsqT8v3Uf7IC8pcQ6buJ2FSq3NcnmO1PmCrHJlXlu8hVWqF6pvFdA";
    private static final String PRIVATE_KEY = "GPJ9DWH4KcgThYviqQ8dUiq5i5YIYkAkxqltnE6QODE";

    private PushService pushService;

    @PostConstruct
    private void init() throws Exception {
        if (Security.getProvider(BouncyCastleProvider.PROVIDER_NAME) == null) {
            Security.addProvider(new BouncyCastleProvider());
        }
        pushService = new PushService(PUBLIC_KEY, PRIVATE_KEY);
        pushService.setSubject("mailto:demo@jarr.app");
    }

    public String getPublicKey() {
        return PUBLIC_KEY;
    }

    @Transactional
    public void subscribe(String email, PushSubscriptionRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        subscriptionRepository.findByEndpoint(request.getEndpoint())
                .ifPresentOrElse(
                        sub -> {
                            sub.setP256dh(request.getKeys().getP256dh());
                            sub.setAuth(request.getKeys().getAuth());
                        },
                        () -> {
                            PushSubscription sub = PushSubscription.builder()
                                    .user(user)
                                    .endpoint(request.getEndpoint())
                                    .p256dh(request.getKeys().getP256dh())
                                    .auth(request.getKeys().getAuth())
                                    .build();
                            subscriptionRepository.save(sub);
                        }
                );
    }

    public void sendPushNotificationToUser(User user, String payload) {
        List<PushSubscription> subscriptions = subscriptionRepository.findAllByUser(user);
        for (PushSubscription sub : subscriptions) {
            try {
                Subscription pushSub = new Subscription(sub.getEndpoint(), new Subscription.Keys(sub.getP256dh(), sub.getAuth()));
                Notification notification = new Notification(pushSub, payload);
                pushService.send(notification);
                log.info("Sent push notification to user: {}", user.getEmail());
            } catch (Exception e) {
                log.error("Failed to send push notification", e);
                // In production, we'd delete the subscription if it returns a 410 Gone (unsubscribe)
            }
        }
    }
}
