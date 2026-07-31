package com.jarr.vault.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;

import java.math.BigDecimal;

public record VaultRequest(
        @NotBlank @Size(max = 100) String name,
        String icon,
        String color,
        BigDecimal targetAmount,
        String notes
) {}
