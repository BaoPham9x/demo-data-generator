-- Staging model: Clean and standardize raw accounts
SELECT
    account_id,
    customer_id,
    created_at,
    account_type,
    account_status,
    currency,
    credit_limit,
    credit_score,
    current_balance,
    balance_updated_at
FROM {{ source('raw', 'raw_accounts') }}
