package com.jarr.report;

import com.jarr.common.TransactionType;
import com.jarr.report.dto.CategoryBreakdownDto;
import com.jarr.report.dto.DailySpendDto;
import com.jarr.report.dto.MonthlySummaryDto;
import com.jarr.report.dto.ReportResponseDto;
import com.jarr.transaction.Transaction;
import com.jarr.transaction.TransactionRepository;
import com.jarr.user.User;
import com.jarr.user.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.math.RoundingMode;
import java.time.LocalDate;
import java.time.YearMonth;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ReportService {

    private final TransactionRepository transactionRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public ReportResponseDto generateReport(String email, int year, int month) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findAllByUserAndTransactionDateBetween(user, startDate, endDate);

        BigDecimal totalIncome = calculateTotal(transactions, TransactionType.INCOME);
        BigDecimal totalExpense = calculateTotal(transactions, TransactionType.EXPENSE);
        BigDecimal netSavings = totalIncome.subtract(totalExpense);

        MonthlySummaryDto summary = MonthlySummaryDto.builder()
                .totalIncome(totalIncome)
                .totalExpense(totalExpense)
                .netSavings(netSavings)
                .build();

        List<Transaction> expenses = transactions.stream()
                .filter(t -> t.getType() == TransactionType.EXPENSE)
                .collect(Collectors.toList());

        List<CategoryBreakdownDto> breakdown = generateCategoryBreakdown(expenses, totalExpense);
        List<DailySpendDto> dailySpends = generateDailySpends(expenses, startDate, endDate);

        return ReportResponseDto.builder()
                .monthlySummary(summary)
                .categoryBreakdown(breakdown)
                .dailySpends(dailySpends)
                .build();
    }

    private BigDecimal calculateTotal(List<Transaction> transactions, TransactionType type) {
        return transactions.stream()
                .filter(t -> t.getType() == type)
                .map(Transaction::getAmount)
                .reduce(BigDecimal.ZERO, BigDecimal::add);
    }

    private List<CategoryBreakdownDto> generateCategoryBreakdown(List<Transaction> expenses, BigDecimal totalExpense) {
        if (totalExpense.compareTo(BigDecimal.ZERO) == 0) {
            return List.of();
        }

        Map<String, List<Transaction>> byCategory = expenses.stream()
                .collect(Collectors.groupingBy(t -> t.getCategory().getName()));

        return byCategory.entrySet().stream()
                .map(entry -> {
                    String categoryName = entry.getKey();
                    List<Transaction> catTx = entry.getValue();
                    String colorHex = catTx.get(0).getCategory().getColorHex();
                    BigDecimal amount = catTx.stream()
                            .map(Transaction::getAmount)
                            .reduce(BigDecimal.ZERO, BigDecimal::add);
                    
                    double percentage = amount.divide(totalExpense, 4, RoundingMode.HALF_UP)
                            .multiply(BigDecimal.valueOf(100))
                            .doubleValue();

                    return CategoryBreakdownDto.builder()
                            .categoryName(categoryName)
                            .colorHex(colorHex)
                            .amount(amount)
                            .percentage(percentage)
                            .build();
                })
                .sorted(Comparator.comparing(CategoryBreakdownDto::getAmount).reversed())
                .collect(Collectors.toList());
    }

    private List<DailySpendDto> generateDailySpends(List<Transaction> expenses, LocalDate startDate, LocalDate endDate) {
        Map<LocalDate, BigDecimal> dailyTotals = expenses.stream()
                .collect(Collectors.groupingBy(
                        Transaction::getTransactionDate,
                        Collectors.reducing(BigDecimal.ZERO, Transaction::getAmount, BigDecimal::add)
                ));

        return startDate.datesUntil(endDate.plusDays(1))
                .map(date -> DailySpendDto.builder()
                        .date(date.toString())
                        .amount(dailyTotals.getOrDefault(date, BigDecimal.ZERO))
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public String exportTransactionsCsv(String email, int year, int month) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));

        YearMonth yearMonth = YearMonth.of(year, month);
        LocalDate startDate = yearMonth.atDay(1);
        LocalDate endDate = yearMonth.atEndOfMonth();

        List<Transaction> transactions = transactionRepository.findAllByUserAndTransactionDateBetween(user, startDate, endDate);
        
        StringBuilder csv = new StringBuilder();
        csv.append("Date,Type,Category,Amount,Note\n");
        
        for (Transaction t : transactions) {
            csv.append(t.getTransactionDate()).append(",")
               .append(t.getType()).append(",")
               .append(escapeCsv(t.getCategory().getName())).append(",")
               .append(t.getAmount()).append(",")
               .append(escapeCsv(t.getNote())).append("\n");
        }
        
        return csv.toString();
    }
    
    private String escapeCsv(String value) {
        if (value == null) return "";
        if (value.contains(",") || value.contains("\"") || value.contains("\n")) {
            return "\"" + value.replace("\"", "\"\"") + "\"";
        }
        return value;
    }
}
