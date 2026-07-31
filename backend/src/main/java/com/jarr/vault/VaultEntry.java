package com.jarr.vault;

import com.jarr.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;

@Entity
@Table(name = "vault_entries")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VaultEntry {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "vault_id", nullable = false)
    private Vault vault;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    @Column(nullable = false, precision = 19, scale = 2)
    private BigDecimal amount;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    private VaultEntryType type;

    @Column(length = 255)
    private String note;

    @Column(name = "entry_date", nullable = false)
    private LocalDate entryDate;

    // Used to link paired transfer entries (TRANSFER_IN <-> TRANSFER_OUT)
    @Column(name = "linked_entry_id")
    private Long linkedEntryId;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
