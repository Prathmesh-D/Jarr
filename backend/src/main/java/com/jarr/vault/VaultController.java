package com.jarr.vault;

import com.jarr.vault.dto.*;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/vaults")
@RequiredArgsConstructor
public class VaultController {

    private final VaultService vaultService;

    // ── Vault CRUD ────────────────────────────────────────────────────────────

    @GetMapping
    public ResponseEntity<List<VaultDto>> getVaults(Authentication auth) {
        return ResponseEntity.ok(vaultService.getVaults(auth.getName()));
    }

    @PostMapping
    public ResponseEntity<VaultDto> createVault(
            Authentication auth,
            @Valid @RequestBody VaultRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.createVault(auth.getName(), request));
    }

    @PatchMapping("/{id}")
    public ResponseEntity<VaultDto> updateVault(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody VaultRequest request) {
        return ResponseEntity.ok(vaultService.updateVault(auth.getName(), id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteVault(
            Authentication auth,
            @PathVariable Long id) {
        vaultService.deleteVault(auth.getName(), id);
        return ResponseEntity.noContent().build();
    }

    // ── Entries ───────────────────────────────────────────────────────────────

    @GetMapping("/{id}/entries")
    public ResponseEntity<List<VaultEntryDto>> getEntries(
            Authentication auth,
            @PathVariable Long id) {
        return ResponseEntity.ok(vaultService.getEntries(auth.getName(), id));
    }

    @PostMapping("/{id}/deposit")
    public ResponseEntity<VaultEntryDto> deposit(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody VaultEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.deposit(auth.getName(), id, request));
    }

    @PostMapping("/{id}/withdraw")
    public ResponseEntity<VaultEntryDto> withdraw(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody VaultEntryRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.withdraw(auth.getName(), id, request));
    }

    @PostMapping("/{id}/transfer")
    public ResponseEntity<List<VaultEntryDto>> transfer(
            Authentication auth,
            @PathVariable Long id,
            @Valid @RequestBody VaultTransferRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(vaultService.transfer(auth.getName(), id, request));
    }

    @DeleteMapping("/entries/{entryId}")
    public ResponseEntity<Void> deleteEntry(
            Authentication auth,
            @PathVariable Long entryId) {
        vaultService.deleteEntry(auth.getName(), entryId);
        return ResponseEntity.noContent().build();
    }
}
