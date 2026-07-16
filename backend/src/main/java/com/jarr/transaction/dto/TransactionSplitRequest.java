package com.jarr.transaction.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TransactionSplitRequest {
    @NotBlank(message = "Person name is required")
    private String personName;

    @NotNull(message = "Amount owed is required")
    @Positive(message = "Amount owed must be positive")
    private BigDecimal amount;

    // "UOME" means they owe the user (Owed To Me)
    // "IOU" means the user owes them (I Owe You)
    @NotBlank(message = "Split type is required")
    private String splitType;
}
