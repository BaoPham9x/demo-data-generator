-- Dimension: Account
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
FROM {{ source('raw', 'raw_accounts') }}
