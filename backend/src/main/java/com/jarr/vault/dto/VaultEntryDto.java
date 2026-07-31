package com.jarr.vault.dto;

import com.jarr.vault.VaultEntryType;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

public record VaultEntryDto(
        Long id,
        Long vaultId,
        String vaultName,
        BigDecimal amount,
        VaultEntryType type,
        String note,
        LocalDate entryDate,
        Long linkedEntryId,
        LocalDateTime createdAt
) {}
