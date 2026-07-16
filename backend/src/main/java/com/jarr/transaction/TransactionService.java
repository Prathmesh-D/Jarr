package com.jarr.transaction;

import com.jarr.category.Category;
import com.jarr.category.CategoryRepository;
import com.jarr.common.exception.ResourceNotFoundException;
import com.jarr.debt.Debt;
import com.jarr.debt.DebtRepository;
import com.jarr.transaction.dto.TransactionRequest;
import com.jarr.transaction.dto.TransactionResponse;
import com.jarr.user.User;
import com.jarr.friend.FriendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Slf4j
public class TransactionService {

    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;
    private final DebtRepository debtRepository;
    private final FriendService friendService;

    @Transactional
    public TransactionResponse createTransaction(User user, TransactionRequest request) {
        log.info("Creating new transaction for user: {}", user.getEmail());
        
        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .amount(request.getAmount())
                .type(request.getType())
                .transactionDate(request.getTransactionDate())
                .note(request.getNote())
                .paymentMethod(request.getPaymentMethod())
                .build();

        Transaction savedTransaction = transactionRepository.save(transaction);

        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            for (com.jarr.transaction.dto.TransactionSplitRequest split : request.getSplits()) {
                friendService.ensureFriendExists(user, split.getPersonName());
                
                Debt splitDebt = Debt.builder()
                        .user(user)
                        .type(com.jarr.debt.DebtType.valueOf(split.getSplitType()))
                        .personName(split.getPersonName())
                        .amount(split.getAmount())
                        .amountPaid(java.math.BigDecimal.ZERO)
                        .note("Split: " + (request.getNote() != null && !request.getNote().isBlank() ? request.getNote() : category.getName()))
                        .isSettled(false)
                        .build();
                debtRepository.save(splitDebt);
            }
        }

        return mapToResponse(savedTransaction);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(User user, Pageable pageable) {
        return transactionRepository.findAllByUserOrderByTransactionDateDescCreatedAtDesc(user, pageable)
                .map(this::mapToResponse);
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(User user, Long id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        return mapToResponse(transaction);
    }

    @Transactional
    public TransactionResponse updateTransaction(User user, Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNote(request.getNote());
        transaction.setPaymentMethod(request.getPaymentMethod());

        Transaction updatedTransaction = transactionRepository.save(transaction);
        return mapToResponse(updatedTransaction);
    }

    @Transactional
    public void deleteTransaction(User user, Long id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        
        if (transaction.getDebt() != null) {
            Debt debt = transaction.getDebt();
            java.math.BigDecimal newAmountPaid = debt.getAmountPaid().subtract(transaction.getAmount());
            if (newAmountPaid.compareTo(java.math.BigDecimal.ZERO) < 0) {
                newAmountPaid = java.math.BigDecimal.ZERO;
            }
            debt.setAmountPaid(newAmountPaid);
            if (debt.getAmountPaid().compareTo(debt.getAmount()) < 0) {
                debt.setSettled(false);
            }
            debtRepository.save(debt);
        }
        
        transactionRepository.delete(transaction);
    }

    private TransactionResponse mapToResponse(Transaction transaction) {
        return TransactionResponse.builder()
                .id(transaction.getId())
                .amount(transaction.getAmount())
                .type(transaction.getType())
                .categoryId(transaction.getCategory().getId())
                .categoryName(transaction.getCategory().getName())
                .categoryIcon(transaction.getCategory().getIconKey())
                .categoryColor(transaction.getCategory().getColorHex())
                .transactionDate(transaction.getTransactionDate())
                .note(transaction.getNote())
                .paymentMethod(transaction.getPaymentMethod())
                .createdAt(transaction.getCreatedAt())
                .build();
    }
}
