-- Fact: Transactions
SELECT
    t.transaction_id,
    t.customer_id,
    dc.customer_key,
    da.account_key,
    dm.merchant_key,
    t.merchant_name,
    t.merchant_category,
    t.transaction_type,
    t.status,
    t.amount,
    t.currency,
    t.fee_amount,
    t.payment_method,
    t.balance_before,
    t.balance_after,
    t.risk_flag,
    t.country,
    t.city,
    t.latitude,
    t.longitude,
    t.created_at
FROM {{ source('raw', 'raw_transactions') }} t
LEFT JOIN {{ ref('dim_customer') }} dc ON t.customer_id = dc.customer_id
LEFT JOIN {{ ref('dim_account') }} da ON t.account_id = da.account_id
LEFT JOIN {{ ref('dim_merchant') }} dm 
    ON CONCAT(COALESCE(t.merchant_name, 'Unknown'), '|', COALESCE(t.merchant_category, 'other')) = dm.merchant_key
WHERE DATE(t.created_at) <= CURRENT_DATE()