package com.jarr.transaction;

import com.jarr.transaction.dto.TransactionRequest;
import com.jarr.transaction.dto.TransactionResponse;
import com.jarr.user.User;
import com.jarr.user.UserRepository;
import com.jarr.common.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.web.PageableDefault;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;
import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/v1/transactions")
@RequiredArgsConstructor
public class TransactionController {

    private final TransactionService transactionService;
    private final UserRepository userRepository;

    private User getUser(Authentication authentication) {
        return userRepository.findByEmail(authentication.getName())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
    }

    @PostMapping
    public ResponseEntity<TransactionResponse> createTransaction(
            Authentication authentication,
            @Valid @RequestBody TransactionRequest request) {
        User user = getUser(authentication);
        
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(transactionService.createTransaction(user, request));
    }

    @GetMapping
    public ResponseEntity<Page<TransactionResponse>> getTransactions(
            Authentication authentication,
            @PageableDefault(size = 20) Pageable pageable) {
        User user = getUser(authentication);
        
        return ResponseEntity.ok(transactionService.getTransactions(user, pageable));
    }

    @GetMapping("/{id}")
    public ResponseEntity<TransactionResponse> getTransaction(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getUser(authentication);
        
        return ResponseEntity.ok(transactionService.getTransaction(user, id));
    }

    @PutMapping("/{id}")
    public ResponseEntity<TransactionResponse> updateTransaction(
            Authentication authentication,
            @PathVariable Long id,
            @Valid @RequestBody TransactionRequest request) {
        User user = getUser(authentication);
        
        return ResponseEntity.ok(transactionService.updateTransaction(user, id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteTransaction(
            Authentication authentication,
            @PathVariable Long id) {
        User user = getUser(authentication);
        
        transactionService.deleteTransaction(user, id);
        return ResponseEntity.noContent().build();
    }
}
