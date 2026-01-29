-- Dimension: Merchant
SELECT DISTINCT
    CONCAT(COALESCE(merchant_name, 'Unknown'), '|', COALESCE(merchant_category, 'other')) as merchant_key,
    merchant_name,
    merchant_category
FROM {{ source('raw', 'raw_transactions') }}
WHERE merchant_name IS NOT NULL OR merchant_category IS NOT NULL
