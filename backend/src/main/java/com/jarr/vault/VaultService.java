package com.jarr.vault;

import com.jarr.user.User;
import com.jarr.user.UserRepository;
import com.jarr.vault.dto.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class VaultService {

    private final VaultRepository vaultRepository;
    private final VaultEntryRepository vaultEntryRepository;
    private final UserRepository userRepository;

    // ── Helpers ─────────────────────────────────────────────────────────────

    private User getUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new RuntimeException("User not found"));
    }

    private Vault getVault(Long vaultId, String email) {
        return vaultRepository.findByIdAndUserEmail(vaultId, email)
                .orElseThrow(() -> new RuntimeException("Vault not found"));
    }

    private BigDecimal getBalance(Long vaultId) {
        BigDecimal balance = vaultEntryRepository.calculateBalance(vaultId);
        return balance == null ? BigDecimal.ZERO : balance;
    }

    private VaultDto mapToDto(Vault vault) {
        return new VaultDto(
                vault.getId(),
                vault.getName(),
                vault.getIcon(),
                vault.getColor(),
                vault.getTargetAmount(),
                getBalance(vault.getId()),
                vault.getNotes(),
                vault.getCreatedAt()
        );
    }

    private VaultEntryDto mapEntryToDto(VaultEntry entry) {
        return new VaultEntryDto(
                entry.getId(),
                entry.getVault().getId(),
                entry.getVault().getName(),
                entry.getAmount(),
                entry.getType(),
                entry.getNote(),
                entry.getEntryDate(),
                entry.getLinkedEntryId(),
                entry.getCreatedAt()
        );
    }

    // ── Vault CRUD ───────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VaultDto> getVaults(String email) {
        return vaultRepository.findByUserEmailOrderByCreatedAtAsc(email)
                .stream().map(this::mapToDto).collect(Collectors.toList());
    }

    @Transactional
    public VaultDto createVault(String email, VaultRequest request) {
        User user = getUser(email);
        Vault vault = Vault.builder()
                .user(user)
                .name(request.name())
                .icon(request.icon() != null ? request.icon() : "PiggyBank")
                .color(request.color() != null ? request.color() : "#3A3A3A")
                .targetAmount(request.targetAmount())
                .notes(request.notes())
                .build();
        return mapToDto(vaultRepository.save(vault));
    }

    @Transactional
    public VaultDto updateVault(String email, Long vaultId, VaultRequest request) {
        Vault vault = getVault(vaultId, email);
        vault.setName(request.name());
        if (request.icon() != null) vault.setIcon(request.icon());
        if (request.color() != null) vault.setColor(request.color());
        vault.setTargetAmount(request.targetAmount());
        vault.setNotes(request.notes());
        return mapToDto(vaultRepository.save(vault));
    }

    @Transactional
    public void deleteVault(String email, Long vaultId) {
        Vault vault = getVault(vaultId, email);
        BigDecimal balance = getBalance(vaultId);
        if (balance.compareTo(BigDecimal.ZERO) != 0) {
            throw new IllegalStateException("Cannot delete vault with a non-zero balance of " + balance);
        }
        vaultRepository.delete(vault);
    }

    // ── Entries ──────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<VaultEntryDto> getEntries(String email, Long vaultId) {
        getVault(vaultId, email); // ownership check
        return vaultEntryRepository.findByVaultIdOrderByEntryDateDescCreatedAtDesc(vaultId)
                .stream().map(this::mapEntryToDto).collect(Collectors.toList());
    }

    @Transactional
    public VaultEntryDto deposit(String email, Long vaultId, VaultEntryRequest request) {
        User user = getUser(email);
        Vault vault = getVault(vaultId, email);
        VaultEntry entry = VaultEntry.builder()
                .vault(vault)
                .user(user)
                .amount(request.amount())
                .type(VaultEntryType.DEPOSIT)
                .note(request.note())
                .entryDate(request.entryDate() != null ? request.entryDate() : LocalDate.now())
                .build();
        return mapEntryToDto(vaultEntryRepository.save(entry));
    }

    @Transactional
    public VaultEntryDto withdraw(String email, Long vaultId, VaultEntryRequest request) {
        User user = getUser(email);
        Vault vault = getVault(vaultId, email);
        BigDecimal currentBalance = getBalance(vaultId);
        if (request.amount().compareTo(currentBalance) > 0) {
            throw new IllegalStateException(
                    "Insufficient vault balance. Current: " + currentBalance + ", Requested: " + request.amount());
        }
        VaultEntry entry = VaultEntry.builder()
                .vault(vault)
                .user(user)
                .amount(request.amount())
                .type(VaultEntryType.WITHDRAWAL)
                .note(request.note())
                .entryDate(request.entryDate() != null ? request.entryDate() : LocalDate.now())
                .build();
        return mapEntryToDto(vaultEntryRepository.save(entry));
    }

    @Transactional
    public List<VaultEntryDto> transfer(String email, Long fromVaultId, VaultTransferRequest request) {
        User user = getUser(email);
        Vault fromVault = getVault(fromVaultId, email);
        Vault toVault = getVault(request.toVaultId(), email);

        if (fromVaultId.equals(request.toVaultId())) {
            throw new IllegalArgumentException("Cannot transfer to the same vault");
        }

        BigDecimal currentBalance = getBalance(fromVaultId);
        if (request.amount().compareTo(currentBalance) > 0) {
            throw new IllegalStateException(
                    "Insufficient vault balance. Current: " + currentBalance + ", Requested: " + request.amount());
        }

        LocalDate date = request.entryDate() != null ? request.entryDate() : LocalDate.now();

        VaultEntry outEntry = VaultEntry.builder()
                .vault(fromVault).user(user)
                .amount(request.amount()).type(VaultEntryType.TRANSFER_OUT)
                .note(request.note()).entryDate(date).build();

        VaultEntry inEntry = VaultEntry.builder()
                .vault(toVault).user(user)
                .amount(request.amount()).type(VaultEntryType.TRANSFER_IN)
                .note(request.note()).entryDate(date).build();

        outEntry = vaultEntryRepository.save(outEntry);
        inEntry = vaultEntryRepository.save(inEntry);

        // Link the two paired entries
        outEntry.setLinkedEntryId(inEntry.getId());
        inEntry.setLinkedEntryId(outEntry.getId());
        vaultEntryRepository.save(outEntry);
        vaultEntryRepository.save(inEntry);

        return List.of(mapEntryToDto(outEntry), mapEntryToDto(inEntry));
    }

    @Transactional
    public void deleteEntry(String email, Long entryId) {
        VaultEntry entry = vaultEntryRepository.findByIdAndUserEmail(entryId, email)
                .orElseThrow(() -> new RuntimeException("Entry not found"));

        // If this is a paired transfer, delete the linked entry too
        if (entry.getLinkedEntryId() != null) {
            vaultEntryRepository.findById(entry.getLinkedEntryId())
                    .ifPresent(vaultEntryRepository::delete);
        }
        vaultEntryRepository.delete(entry);
    }
}
