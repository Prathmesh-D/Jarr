package com.jarr.vault;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;

public interface VaultRepository extends JpaRepository<Vault, Long> {

    List<Vault> findByUserEmailOrderByCreatedAtAsc(String email);

    @Query("SELECT v FROM Vault v WHERE v.id = :id AND v.user.email = :email")
    java.util.Optional<Vault> findByIdAndUserEmail(@Param("id") Long id, @Param("email") String email);
}
