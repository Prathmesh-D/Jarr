package com.jarr.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DailySpendDto {
    private String date; // ISO 8601 string like "2026-07-13"
    private BigDecimal amount;
}
