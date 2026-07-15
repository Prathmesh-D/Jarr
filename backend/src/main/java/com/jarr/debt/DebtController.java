package com.jarr.debt;

import com.jarr.debt.dto.DebtDto;
import com.jarr.debt.dto.DebtRequest;
import com.jarr.debt.dto.DebtPaymentRequest;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/debts")
@RequiredArgsConstructor
public class DebtController {

    private final DebtService debtService;

    @GetMapping
    public ResponseEntity<List<DebtDto>> getDebts(Authentication authentication) {
        return ResponseEntity.ok(debtService.getDebts(authentication.getName()));
    }

    @PostMapping
    public ResponseEntity<DebtDto> createDebt(
            Authentication authentication,
            @Valid @RequestBody DebtRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(debtService.createDebt(authentication.getName(), request));
    }

    @PatchMapping("/{id}/settle")
    public ResponseEntity<DebtDto> settleDebt(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(debtService.settleDebt(authentication.getName(), id));
    }

    @PatchMapping("/{id}/mark-done")
    public ResponseEntity<DebtDto> markAsDone(
            Authentication authentication,
            @PathVariable Long id) {
        return ResponseEntity.ok(debtService.markAsDone(authentication.getName(), id));
    }

    @PatchMapping("/{id}/pay")
    public ResponseEntity<DebtDto> payDebt(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody DebtPaymentRequest request) {
        return ResponseEntity.ok(debtService.payDebt(authentication.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteDebt(
            Authentication authentication,
            @PathVariable Long id) {
        debtService.deleteDebt(authentication.getName(), id);
        return ResponseEntity.noContent().build();
    }
}
