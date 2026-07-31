-- V11: Vaults and VaultEntries for the Savings/Vault feature

CREATE TABLE vaults (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    user_id         BIGINT NOT NULL,
    name            VARCHAR(100) NOT NULL,
    icon            VARCHAR(50) DEFAULT '🏦',
    color           VARCHAR(20) DEFAULT '#3A3A3A',
    target_amount   DECIMAL(19, 2),
    notes           VARCHAR(255),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vault_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

CREATE TABLE vault_entries (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    vault_id        BIGINT NOT NULL,
    user_id         BIGINT NOT NULL,
    amount          DECIMAL(19, 2) NOT NULL,
    type            ENUM('DEPOSIT', 'WITHDRAWAL', 'TRANSFER_IN', 'TRANSFER_OUT') NOT NULL,
    note            VARCHAR(255),
    entry_date      DATE NOT NULL,
    linked_entry_id BIGINT,
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_vault_entry_vault FOREIGN KEY (vault_id) REFERENCES vaults(id) ON DELETE CASCADE,
    CONSTRAINT fk_vault_entry_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
