-- Dimension: Customer
SELECT
    customer_id as customer_key,
    customer_id,
    first_name,
    last_name,
    email,
    country,
    city,
    region,
    timezone,
    registration_source,
    kyb_status,
    kyb_started_at,
    kyb_submitted_at,
    kyb_approved_at,
    activated_at,
    customer_tier,
    account_status,
    risk_score,
    created_at,
    -- Derived fields
    CASE WHEN activated_at IS NOT NULL THEN 1 ELSE 0 END as is_activated,
    CASE 
        WHEN kyb_approved_at IS NOT NULL AND kyb_started_at IS NOT NULL 
        THEN DATE_DIFF(kyb_approved_at, kyb_started_at, DAY)
        ELSE NULL
    END as kyb_completion_days,
    CASE 
        WHEN activated_at IS NOT NULL AND created_at IS NOT NULL 
        THEN DATE_DIFF(activated_at, created_at, DAY)
        ELSE NULL
    END as time_to_activation_days
FROM {{ source('raw', 'raw_customers') }}
