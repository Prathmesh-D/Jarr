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
public class CategoryBreakdownDto {
    private String categoryName;
    private String colorHex;
    private BigDecimal amount;
    private double percentage;
}
