package com.jarr.vault;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

public interface VaultEntryRepository extends JpaRepository<VaultEntry, Long> {

    List<VaultEntry> findByVaultIdOrderByEntryDateDescCreatedAtDesc(Long vaultId);

    @Query("SELECT COALESCE(SUM(CASE WHEN e.type IN ('DEPOSIT','TRANSFER_IN') THEN e.amount ELSE -e.amount END), 0) FROM VaultEntry e WHERE e.vault.id = :vaultId")
    BigDecimal calculateBalance(@Param("vaultId") Long vaultId);

    @Query("SELECT e FROM VaultEntry e WHERE e.id = :id AND e.user.email = :email")
    Optional<VaultEntry> findByIdAndUserEmail(@Param("id") Long id, @Param("email") String email);
}
