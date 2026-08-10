CREATE INDEX idx_transactions_user_date_created ON transactions(user_id, transaction_date DESC, created_at DESC);
CREATE INDEX idx_transactions_user_type ON transactions(user_id, type);
CREATE INDEX idx_transactions_user_amount ON transactions(user_id, amount);
