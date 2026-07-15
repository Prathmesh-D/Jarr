-- Create dedicated system categories for debt tracking
INSERT INTO categories (user_id, name, icon_key, color_hex, type, is_default, is_archived) VALUES
    (NULL, 'Debt Repayment',  'account_balance_wallet', '#e03a3c', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Debt Collection', 'account_balance',        '#32968c', 'INCOME',  TRUE, FALSE);
