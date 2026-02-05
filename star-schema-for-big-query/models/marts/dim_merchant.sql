-- Dimension: Merchant
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.dim_merchant AS
SELECT DISTINCT
    CONCAT(COALESCE(merchant_name, 'Unknown'), '|', COALESCE(merchant_category, 'other')) as merchant_key,
    merchant_name,
    merchant_category
FROM `steep-demo.steep_demo_fintech.raw_transactions`
WHERE merchant_name IS NOT NULL OR merchant_category IS NOT NULL
