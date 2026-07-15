-- V2__seed_default_categories.sql
-- Seeds the 9 default categories per Backend Schema Section 4
-- user_id = NULL makes them visible to all users via query:
--   WHERE user_id = :userId OR (is_default = TRUE AND user_id IS NULL)

INSERT INTO categories (user_id, name, icon_key, color_hex, type, is_default, is_archived) VALUES
    (NULL, 'Food & Drink',       'food',           '#f39a1d', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Transport',          'transport',      '#1c7f99', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Shopping',           'shopping',       '#f2d14b', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Bills & Utilities',  'bills',          '#0f5c6d', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Entertainment',      'entertainment',  '#f39a1d', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Health',             'health',         '#1c7f99', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Housing',            'housing',        '#0f5c6d', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Other',              'other',          '#7a7a7a', 'EXPENSE', TRUE, FALSE),
    (NULL, 'Income',             'income',         '#1c7f99', 'INCOME',  TRUE, FALSE);
