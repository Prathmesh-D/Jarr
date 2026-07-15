package com.jarr.category;

import com.jarr.common.TransactionType;
import com.jarr.user.User;
import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

/**
 * Category entity — per Backend Schema Section 2.2 & 3.
 * user_id is nullable for system default categories.
 */
@Entity
@Table(name = "categories",
       uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "name"}))
@Getter @Setter
@NoArgsConstructor @AllArgsConstructor
@Builder
public class Category {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // nullable for system default categories

    @Column(nullable = false, length = 60)
    private String name;

    @Column(name = "icon_key", nullable = false, length = 60)
    private String iconKey;

    @Column(name = "color_hex", nullable = false, length = 7)
    private String colorHex;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false)
    @Builder.Default
    private TransactionType type = TransactionType.EXPENSE;

    @Column(name = "is_default", nullable = false)
    @Builder.Default
    private boolean isDefault = false;

    @Column(name = "is_archived", nullable = false)
    @Builder.Default
    private boolean isArchived = false;

    @CreationTimestamp
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;
}
