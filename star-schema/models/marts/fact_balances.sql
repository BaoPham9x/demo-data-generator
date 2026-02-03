-- Fact: Account Balances (Time Series)
-- Daily balance snapshots for time-series analysis
-- Note: If balances are split into multiple files, union them here
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.fact_balances AS
WITH all_balances AS (
    SELECT * FROM `steep-demo.steep_demo_fintech.raw_balances`
    -- If you have split files, uncomment and add:
    -- UNION ALL
    -- SELECT * FROM `steep-demo.steep_demo_fintech.raw_balances_part_aa`
    -- UNION ALL
    -- SELECT * FROM `steep-demo.steep_demo_fintech.raw_balances_part_ab`
    -- UNION ALL
    -- SELECT * FROM `steep-demo.steep_demo_fintech.raw_balances_part_ac`
)
SELECT
    b.balance_snapshot_id,
    da.account_key,
    b.balance_amount,
    b.currency,
    b.balance_date,
    b.created_at
FROM all_balances b
LEFT JOIN `steep-demo.steep_demo_fintech.dim_account` da ON b.account_id = da.account_id
WHERE b.balance_date <= CURRENT_DATE()
