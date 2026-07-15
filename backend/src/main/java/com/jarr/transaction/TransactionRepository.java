package com.jarr.transaction;

import com.jarr.common.TransactionType;
import com.jarr.user.User;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.time.LocalDate;
import java.util.List;
import java.util.Optional;

public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    
    Optional<Transaction> findByIdAndUser(Long id, User user);
    
    Page<Transaction> findAllByUserOrderByTransactionDateDescCreatedAtDesc(User user, Pageable pageable);
    
    List<Transaction> findAllByUserAndTransactionDateBetween(User user, LocalDate startDate, LocalDate endDate);
    
    @Query("SELECT t FROM Transaction t WHERE t.user = :user AND t.type = :type AND t.transactionDate BETWEEN :startDate AND :endDate")
    List<Transaction> findTransactionsByTypeAndDateRange(
            @Param("user") User user, 
            @Param("type") TransactionType type, 
            @Param("startDate") LocalDate startDate, 
            @Param("endDate") LocalDate endDate
    );
}
