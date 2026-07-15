package com.jarr.category;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import com.jarr.common.TransactionType;

@Repository
public interface CategoryRepository extends JpaRepository<Category, Long> {

    /**
     * Fetch categories visible to a user:
     * their own custom categories + system default categories (user_id IS NULL).
     * Per Backend Schema Section 4.
     */
    @Query("SELECT c FROM Category c LEFT JOIN c.user u WHERE (u.id = :userId OR (c.isDefault = true AND u IS NULL)) AND c.isArchived = false ORDER BY c.isDefault DESC, c.name ASC")
    List<Category> findVisibleByUserId(@Param("userId") Long userId);

    boolean existsByUserIdAndNameAndIsArchivedFalse(Long userId, String name);
    
    Optional<Category> findByUserIdAndName(Long userId, String name);
    
    Optional<Category> findFirstByNameAndIsDefaultTrue(String name);
}
