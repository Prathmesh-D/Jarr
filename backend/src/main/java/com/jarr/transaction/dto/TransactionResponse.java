package com.jarr.transaction.dto;

import com.jarr.common.TransactionType;
import com.jarr.debt.DebtType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionResponse {
    private Long id;
    private BigDecimal amount;
    private TransactionType type;
    private Long categoryId;
    private String categoryName;
    private String categoryIcon;
    private String categoryColor;
    private LocalDate transactionDate;
    private String note;
    private String paymentMethod;
    private LocalDateTime createdAt;
    private List<SplitResponse> splits;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SplitResponse {
        private Long debtId;
        private String personName;
        private BigDecimal amount;
        private DebtType splitType;
    }
}
