package com.jarr.debt;

import com.jarr.debt.dto.DebtDto;
import com.jarr.debt.dto.DebtRequest;
import com.jarr.debt.dto.DebtPaymentRequest;
import com.jarr.user.User;
import com.jarr.user.UserRepository;
import com.jarr.category.Category;
import com.jarr.category.CategoryRepository;
import com.jarr.common.TransactionType;
import com.jarr.transaction.Transaction;
import com.jarr.transaction.TransactionRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DebtService {

    private final DebtRepository debtRepository;
    private final UserRepository userRepository;
    private final TransactionRepository transactionRepository;
    private final CategoryRepository categoryRepository;

    @Transactional(readOnly = true)
    public List<DebtDto> getDebts(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
        return debtRepository.findAllByUserOrderByCreatedAtDesc(user).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public DebtDto createDebt(String email, DebtRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Debt debt = Debt.builder()
                .user(user)
                .type(request.getType())
                .personName(request.getPersonName())
                .amount(request.getAmount())
                .note(request.getNote())
                .dueDate(request.getDueDate())
                .amountPaid(BigDecimal.ZERO)
                .isSettled(false)
                .build();

        return mapToDto(debtRepository.save(debt));
    }

    @Transactional
    public DebtDto settleDebt(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));

        BigDecimal remainingAmount = debt.getAmount().subtract(debt.getAmountPaid());
        debt.setSettled(true);
        debt.setAmountPaid(debt.getAmount());
        
        if (remainingAmount.compareTo(BigDecimal.ZERO) > 0) {
            createDebtTransaction(user, debt, remainingAmount);
        }
        
        return mapToDto(debtRepository.save(debt));
    }

    @Transactional
    public DebtDto markAsDone(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));

        debt.setSettled(true);
        // Note: We intentionally do NOT create a transaction here.
        // We also do not change the amountPaid to equal amount, so the history shows it was forgiven/dismissed.
        
        return mapToDto(debtRepository.save(debt));
    }

    @Transactional
    public DebtDto payDebt(String email, Long id, DebtPaymentRequest request) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));

        if (debt.isSettled()) {
            throw new RuntimeException("Debt is already settled");
        }

        BigDecimal paymentAmount = request.getAmount();
        BigDecimal newAmountPaid = debt.getAmountPaid().add(paymentAmount);
        
        if (newAmountPaid.compareTo(debt.getAmount()) >= 0) {
            paymentAmount = debt.getAmount().subtract(debt.getAmountPaid());
            debt.setAmountPaid(debt.getAmount());
            debt.setSettled(true);
        } else {
            debt.setAmountPaid(newAmountPaid);
        }
        
        if (paymentAmount.compareTo(BigDecimal.ZERO) > 0) {
            createDebtTransaction(user, debt, paymentAmount);
        }

        return mapToDto(debtRepository.save(debt));
    }

    @Transactional
    public void deleteDebt(String email, Long id) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        Debt debt = debtRepository.findByIdAndUser(id, user)
                .orElseThrow(() -> new RuntimeException("Debt not found"));

        debtRepository.delete(debt);
    }

    private void createDebtTransaction(User user, Debt debt, BigDecimal paymentAmount) {
        TransactionType type = debt.getType() == DebtType.IOU ? TransactionType.EXPENSE : TransactionType.INCOME;
        String categoryName = debt.getType() == DebtType.IOU ? "Debt Repayment" : "Debt Collection";
        Category category = categoryRepository.findFirstByNameAndIsDefaultTrue(categoryName)
                .orElseThrow(() -> new RuntimeException("Default category not found for " + categoryName));

        Transaction transaction = Transaction.builder()
                .user(user)
                .category(category)
                .debt(debt)
                .amount(paymentAmount)
                .type(type)
                .transactionDate(LocalDate.now())
                .note("Payment for debt to " + debt.getPersonName())
                .paymentMethod("Cash")
                .build();
        
        transactionRepository.save(transaction);
    }

    private DebtDto mapToDto(Debt debt) {
        return DebtDto.builder()
                .id(debt.getId())
                .type(debt.getType())
                .personName(debt.getPersonName())
                .amount(debt.getAmount())
                .note(debt.getNote())
                .dueDate(debt.getDueDate())
                .amountPaid(debt.getAmountPaid())
                .isSettled(debt.isSettled())
                .createdAt(debt.getCreatedAt())
                .build();
    }
}
