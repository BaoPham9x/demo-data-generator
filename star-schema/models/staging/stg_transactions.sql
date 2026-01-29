-- Staging model: Clean and standardize raw transactions
SELECT
    transaction_id,
    customer_id,
    account_id,
    created_at,
    transaction_type,
    status,
    amount,
    currency,
    fee_amount,
    merchant_name,
    merchant_category,
    payment_method,
    balance_before,
    balance_after,
    risk_flag,
    country,
    city,
    latitude,
    longitude
FROM {{ source('raw', 'raw_transactions') }}
