-- Staging model: Clean and standardize raw customer features
SELECT
    customer_feature_id,
    customer_id,
    feature_name,
    activated_at,
    last_used_at,
    feature_category,
    is_active
FROM {{ source('raw', 'raw_customer_features') }}
