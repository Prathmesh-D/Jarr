-- V10__add_source_transaction_to_debts.sql
-- Links split-created debts back to their source transaction
-- Enables clean edit/deletion of splits when a transaction is updated

ALTER TABLE debts ADD COLUMN source_transaction_id BIGINT NULL;

ALTER TABLE debts ADD CONSTRAINT fk_debt_source_transaction
  FOREIGN KEY (source_transaction_id) REFERENCES transactions(id) ON DELETE SET NULL;
