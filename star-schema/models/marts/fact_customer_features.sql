-- Fact: Customer Features
SELECT
    cf.customer_feature_id,
    dc.customer_key,
    cf.feature_name,
    cf.feature_category,
    cf.is_active,
    cf.activated_at,
    cf.last_used_at
FROM {{ source('raw', 'raw_customer_features') }} cf
LEFT JOIN {{ ref('dim_customer') }} dc ON cf.customer_id = dc.customer_id
WHERE DATE(cf.activated_at) <= CURRENT_DATE()