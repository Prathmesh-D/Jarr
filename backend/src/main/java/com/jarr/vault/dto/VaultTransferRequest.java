package com.jarr.vault.dto;

import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;

import java.math.BigDecimal;
import java.time.LocalDate;

public record VaultTransferRequest(
        @NotNull Long toVaultId,
        @NotNull @Positive BigDecimal amount,
        String note,
        @NotNull LocalDate entryDate
) {}
