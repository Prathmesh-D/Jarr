package com.jarr.debt.dto;

import com.jarr.debt.DebtType;
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
public class DebtDto {
    private Long id;
    private DebtType type;
    private String personName;
    private BigDecimal amount;
    private String note;
    private boolean isSettled;
    private LocalDate dueDate;
    private BigDecimal amountPaid;
    private LocalDateTime createdAt;
}
