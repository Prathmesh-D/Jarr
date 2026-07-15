package com.jarr.report;

import com.jarr.report.dto.ReportResponseDto;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/v1/reports")
@RequiredArgsConstructor
public class ReportController {

    private final ReportService reportService;

    @GetMapping
    public ResponseEntity<ReportResponseDto> getReport(
            Authentication authentication,
            @RequestParam int year,
            @RequestParam int month) {
        
        ReportResponseDto report = reportService.generateReport(authentication.getName(), year, month);
        return ResponseEntity.ok(report);
    }

    @GetMapping("/export")
    public ResponseEntity<byte[]> exportCsv(
            Authentication authentication,
            @RequestParam int year,
            @RequestParam int month) {
        
        String csv = reportService.exportTransactionsCsv(authentication.getName(), year, month);
        byte[] csvBytes = csv.getBytes(java.nio.charset.StandardCharsets.UTF_8);
        
        String filename = "transactions_" + year + "_" + month + ".csv";
        
        org.springframework.http.HttpHeaders headers = new org.springframework.http.HttpHeaders();
        headers.set(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION, "attachment; filename=" + filename);
        headers.set(org.springframework.http.HttpHeaders.CONTENT_TYPE, "text/csv");
        
        return ResponseEntity.ok()
                .headers(headers)
                .body(csvBytes);
    }
}
