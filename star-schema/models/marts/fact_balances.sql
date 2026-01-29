-- Fact: Account Balances (Time Series)
-- Daily balance snapshots for time-series analysis
-- Union all 3 parts and filter out future dates
WITH all_balances AS (
    SELECT * FROM {{ source('raw', 'raw_balances') }}
    UNION ALL
    SELECT * FROM {{ source('raw', 'raw_balances_1') }}
    UNION ALL
    SELECT * FROM {{ source('raw', 'raw_balances_2') }}
)
SELECT
    b.balance_snapshot_id,
    da.account_key,
    dc.customer_key,
    b.balance_amount,
    b.currency,
    b.balance_date,
    b.created_at
FROM all_balances b
LEFT JOIN {{ ref('dim_account') }} da ON b.account_id = da.account_id
LEFT JOIN {{ ref('dim_customer') }} dc ON da.customer_id = dc.customer_id
WHERE b.balance_date <= CURRENT_DATE()