package com.jarr.transaction.dto;

import com.jarr.common.TransactionType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

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
}
