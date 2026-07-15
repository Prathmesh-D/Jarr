package com.jarr.notifications;

import com.jarr.debt.Debt;
import com.jarr.debt.DebtRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Slf4j
@Component
@RequiredArgsConstructor
public class DebtReminderTask {

    private final DebtRepository debtRepository;
    private final NotificationService notificationService;

    // Run every day at 9 AM
    @Scheduled(cron = "0 0 9 * * ?")
    @Transactional(readOnly = true)
    public void checkAndSendDebtReminders() {
        log.info("Starting daily debt reminder check");
        LocalDate maxDueDate = LocalDate.now().plusDays(3);
        LocalDate today = LocalDate.now();

        List<Debt> upcomingDebts = debtRepository.findByIsSettledFalseAndDueDateLessThanEqual(maxDueDate);

        for (Debt debt : upcomingDebts) {
            if (debt.getDueDate() == null) continue;

            String message;
            long daysUntilDue = java.time.temporal.ChronoUnit.DAYS.between(today, debt.getDueDate());

            if (daysUntilDue < 0) {
                message = String.format("⚠️ Overdue: Debt for %s is overdue by %d days!", debt.getPersonName(), Math.abs(daysUntilDue));
            } else if (daysUntilDue == 0) {
                message = String.format("🚨 Due Today: Debt for %s is due today!", debt.getPersonName());
            } else {
                message = String.format("📅 Reminder: Debt for %s is due in %d days.", debt.getPersonName(), daysUntilDue);
            }

            // Create JSON payload for Service Worker
            String payload = String.format("{\"title\": \"Jarr Reminder\", \"body\": \"%s\"}", message);
            
            notificationService.sendPushNotificationToUser(debt.getUser(), payload);
        }
        
        log.info("Finished daily debt reminder check");
    }
}
