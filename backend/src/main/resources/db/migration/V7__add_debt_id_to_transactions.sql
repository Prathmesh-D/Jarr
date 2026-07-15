ALTER TABLE transactions ADD COLUMN debt_id BIGINT NULL;
ALTER TABLE transactions ADD CONSTRAINT fk_transactions_debt FOREIGN KEY (debt_id) REFERENCES debts(id) ON DELETE SET NULL;
