package com.jarr.debt;

import com.jarr.user.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface DebtRepository extends JpaRepository<Debt, Long> {
    List<Debt> findAllByUserOrderByCreatedAtDesc(User user);
    Optional<Debt> findByIdAndUser(Long id, User user);
    
    // For cron job to find debts due before a certain date (e.g., today + 3 days)
    List<Debt> findByIsSettledFalseAndDueDateLessThanEqual(LocalDate maxDueDate);

    // For split-debt cleanup when editing a transaction
    List<Debt> findBySourceTransactionId(Long sourceTransactionId);
    void deleteBySourceTransactionId(Long sourceTransactionId);
}
