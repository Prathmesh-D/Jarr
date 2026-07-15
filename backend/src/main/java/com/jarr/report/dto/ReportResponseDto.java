package com.jarr.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ReportResponseDto {
    private MonthlySummaryDto monthlySummary;
    private List<CategoryBreakdownDto> categoryBreakdown;
    private List<DailySpendDto> dailySpends;
}
