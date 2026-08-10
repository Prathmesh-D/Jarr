ALTER TABLE transactions
ADD COLUMN vault_entry_id BIGINT;

ALTER TABLE transactions
ADD CONSTRAINT fk_transactions_vault_entry
FOREIGN KEY (vault_entry_id) REFERENCES vault_entries(id)
ON DELETE SET NULL;
