package com.jarr.transaction;

import com.jarr.category.Category;
import com.jarr.category.CategoryRepository;
import com.jarr.common.exception.ResourceNotFoundException;
import com.jarr.common.exception.BadRequestException;
import com.jarr.debt.Debt;
import com.jarr.debt.DebtRepository;
import com.jarr.debt.DebtType;
import com.jarr.transaction.dto.TransactionRequest;
import com.jarr.transaction.dto.TransactionResponse;
import com.jarr.transaction.dto.TransactionSplitRequest;
import com.jarr.user.User;
import com.jarr.friend.FriendService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.util.Collections;
import java.util.List;
import java.util.stream.Collectors;

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

        List<Debt> createdSplits = Collections.emptyList();
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            validateSplitsTotal(request.getAmount(), request.getSplits());
            createdSplits = createSplitDebts(user, savedTransaction, request.getSplits(), category);
        }

        return mapToResponse(savedTransaction, createdSplits);
    }

    @Transactional(readOnly = true)
    public Page<TransactionResponse> getTransactions(User user, Pageable pageable) {
        return transactionRepository.findAllByUserOrderByTransactionDateDescCreatedAtDesc(user, pageable)
                .map(tx -> {
                    List<Debt> splits = debtRepository.findBySourceTransactionId(tx.getId());
                    return mapToResponse(tx, splits);
                });
    }

    @Transactional(readOnly = true)
    public TransactionResponse getTransaction(User user, Long id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        List<Debt> splits = debtRepository.findBySourceTransactionId(id);
        return mapToResponse(transaction, splits);
    }

    @Transactional
    public TransactionResponse updateTransaction(User user, Long id, TransactionRequest request) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));

        Category category = categoryRepository.findById(request.getCategoryId())
                .orElseThrow(() -> new ResourceNotFoundException("Category not found with id: " + request.getCategoryId()));

        // Update basic fields
        transaction.setAmount(request.getAmount());
        transaction.setType(request.getType());
        transaction.setCategory(category);
        transaction.setTransactionDate(request.getTransactionDate());
        transaction.setNote(request.getNote());
        transaction.setPaymentMethod(request.getPaymentMethod());

        Transaction updatedTransaction = transactionRepository.save(transaction);

        // Delete old split-debts linked to this transaction
        debtRepository.deleteBySourceTransactionId(id);

        // Recreate new split-debts from the updated payload
        List<Debt> newSplits = Collections.emptyList();
        if (request.getSplits() != null && !request.getSplits().isEmpty()) {
            validateSplitsTotal(request.getAmount(), request.getSplits());
            newSplits = createSplitDebts(user, updatedTransaction, request.getSplits(), category);
        }

        return mapToResponse(updatedTransaction, newSplits);
    }

    @Transactional
    public void deleteTransaction(User user, Long id) {
        Transaction transaction = transactionRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new ResourceNotFoundException("Transaction not found with id: " + id));
        
        if (transaction.getDebt() != null) {
            Debt debt = transaction.getDebt();
            BigDecimal newAmountPaid = debt.getAmountPaid().subtract(transaction.getAmount());
            if (newAmountPaid.compareTo(BigDecimal.ZERO) < 0) {
                newAmountPaid = BigDecimal.ZERO;
            }
            debt.setAmountPaid(newAmountPaid);
            if (debt.getAmountPaid().compareTo(debt.getAmount()) < 0) {
                debt.setSettled(false);
            }
            debtRepository.save(debt);
        }

        // Also delete any split-debts this transaction generated
        debtRepository.deleteBySourceTransactionId(id);
        
        transactionRepository.delete(transaction);
    }

    // ─── Private helpers ──────────────────────────────────────────────────────

    private void validateSplitsTotal(BigDecimal transactionAmount, List<TransactionSplitRequest> splits) {
        BigDecimal totalSplitAmount = splits.stream()
                .map(TransactionSplitRequest::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);

        if (totalSplitAmount.compareTo(transactionAmount) > 0) {
            throw new BadRequestException("Total split amount (" + totalSplitAmount + ") cannot exceed the transaction amount (" + transactionAmount + ").");
        }
    }

    private List<Debt> createSplitDebts(User user, Transaction transaction,
                                         List<TransactionSplitRequest> splits, Category category) {
        return splits.stream().map(split -> {
            friendService.ensureFriendExists(user, split.getPersonName());

            Debt splitDebt = Debt.builder()
                    .user(user)
                    .type(DebtType.valueOf(split.getSplitType()))
                    .personName(split.getPersonName())
                    .amount(split.getAmount())
                    .amountPaid(BigDecimal.ZERO)
                    .note("Split: " + (transaction.getNote() != null && !transaction.getNote().isBlank()
                            ? transaction.getNote() : category.getName()))
                    .isSettled(false)
                    .sourceTransactionId(transaction.getId())
                    .build();

            return debtRepository.save(splitDebt);
        }).collect(Collectors.toList());
    }

    private TransactionResponse mapToResponse(Transaction transaction, List<Debt> splits) {
        List<TransactionResponse.SplitResponse> splitResponses = splits.stream()
                .map(d -> TransactionResponse.SplitResponse.builder()
                        .debtId(d.getId())
                        .personName(d.getPersonName())
                        .amount(d.getAmount())
                        .splitType(d.getType())
                        .build())
                .collect(Collectors.toList());

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
                .splits(splitResponses)
                .build();
    }
}
