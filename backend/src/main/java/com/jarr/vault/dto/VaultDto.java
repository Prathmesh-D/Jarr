package com.jarr.vault.dto;

import java.math.BigDecimal;
import java.time.LocalDateTime;

public record VaultDto(
        Long id,
        String name,
        String icon,
        String color,
        BigDecimal targetAmount,
        BigDecimal currentBalance,
        String notes,
        LocalDateTime createdAt
) {}
