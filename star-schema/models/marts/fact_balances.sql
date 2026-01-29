-- Fact: Account Balances (Time Series)
-- Daily balance snapshots for time-series analysis
SELECT
    b.balance_snapshot_id,
    da.account_key,
    dd.date_key,
    b.balance_amount,
    b.currency,
    b.balance_date,
    b.created_at
FROM {{ source('raw', 'raw_balances') }} b
LEFT JOIN {{ ref('dim_account') }} da ON b.account_id = da.account_id
LEFT JOIN {{ ref('dim_date') }} dd ON b.balance_date = dd.date
