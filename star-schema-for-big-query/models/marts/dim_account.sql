-- Dimension: Account
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.dim_account AS
SELECT
    account_id as account_key,
    account_id,
    customer_id,
    account_type,
    account_status,
    currency,
    credit_limit,
    credit_score,
    current_balance,
    created_at,
    balance_updated_at
FROM `steep-demo.steep_demo_fintech.raw_accounts`
