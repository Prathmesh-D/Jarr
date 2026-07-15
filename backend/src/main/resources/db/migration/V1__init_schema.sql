-- V1__init_schema.sql
-- Jarr Database Schema — MySQL 8.x, InnoDB, UTF-8mb4
-- Per Backend Schema Document Sections 2.1–2.5

-- =============================================
-- 1. USERS
-- =============================================
CREATE TABLE users (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    name            VARCHAR(100)    NOT NULL,
    email           VARCHAR(150)    NOT NULL,
    password_hash   VARCHAR(255)    NOT NULL,
    currency        VARCHAR(3)      NOT NULL DEFAULT 'USD',
    date_format     VARCHAR(20)     NOT NULL DEFAULT 'DD/MM/YYYY',
    avatar_url      VARCHAR(500)    NULL,
    notification_enabled BOOLEAN    NOT NULL DEFAULT FALSE,
    notification_time    TIME        NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_users_email (email)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 2. CATEGORIES
-- =============================================
CREATE TABLE categories (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NULL,
    name            VARCHAR(60)     NOT NULL,
    icon_key        VARCHAR(60)     NOT NULL,
    color_hex       VARCHAR(7)      NOT NULL,
    type            ENUM('EXPENSE','INCOME') NOT NULL DEFAULT 'EXPENSE',
    is_default      BOOLEAN         NOT NULL DEFAULT FALSE,
    is_archived     BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_categories_user_name (user_id, name),
    CONSTRAINT fk_categories_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 3. TRANSACTIONS
-- =============================================
CREATE TABLE transactions (
    id                  BIGINT          NOT NULL AUTO_INCREMENT,
    user_id             BIGINT          NOT NULL,
    category_id         BIGINT          NOT NULL,
    amount              DECIMAL(12,2)   NOT NULL,
    type                ENUM('EXPENSE','INCOME') NOT NULL,
    transaction_date    DATE            NOT NULL,
    note                VARCHAR(255)    NULL,
    payment_method      VARCHAR(50)     NULL,
    receipt_url         VARCHAR(500)    NULL,
    created_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at          DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT chk_transactions_amount CHECK (amount > 0),
    CONSTRAINT fk_transactions_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_transactions_category FOREIGN KEY (category_id) REFERENCES categories(id),
    INDEX idx_txn_user_date (user_id, transaction_date),
    INDEX idx_txn_category (category_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 4. BUDGETS
-- =============================================
CREATE TABLE budgets (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    category_id     BIGINT          NOT NULL,
    month           DATE            NOT NULL COMMENT 'First day of the month, e.g. 2026-07-01',
    limit_amount    DECIMAL(12,2)   NOT NULL,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    CONSTRAINT chk_budgets_limit CHECK (limit_amount > 0),
    UNIQUE KEY uk_budgets_user_cat_month (user_id, category_id, month),
    CONSTRAINT fk_budgets_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    CONSTRAINT fk_budgets_category FOREIGN KEY (category_id) REFERENCES categories(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =============================================
-- 5. REFRESH TOKENS
-- =============================================
CREATE TABLE refresh_tokens (
    id              BIGINT          NOT NULL AUTO_INCREMENT,
    user_id         BIGINT          NOT NULL,
    token_hash      VARCHAR(255)    NOT NULL,
    expires_at      DATETIME        NOT NULL,
    revoked         BOOLEAN         NOT NULL DEFAULT FALSE,
    created_at      DATETIME        NOT NULL DEFAULT CURRENT_TIMESTAMP,

    PRIMARY KEY (id),
    UNIQUE KEY uk_refresh_tokens_hash (token_hash),
    CONSTRAINT fk_refresh_tokens_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
