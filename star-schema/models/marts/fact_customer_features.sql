-- Fact: Customer Features
SELECT
    cf.customer_feature_id,
    dc.customer_key,
    dd.date_key,
    cf.feature_name,
    cf.feature_category,
    cf.is_active,
    cf.activated_at,
    cf.last_used_at
FROM {{ source('raw', 'raw_customer_features') }} cf
LEFT JOIN {{ ref('dim_customer') }} dc ON cf.customer_id = dc.customer_id
LEFT JOIN {{ ref('dim_date') }} dd ON DATE(cf.activated_at) = dd.date
