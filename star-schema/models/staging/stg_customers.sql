-- Staging model: Clean and standardize raw customers
SELECT
    customer_id,
    created_at,
    email,
    first_name,
    last_name,
    country,
    city,
    region,
    timezone,
    registration_source,
    kyb_started_at,
    kyb_submitted_at,
    kyb_approved_at,
    kyb_status,
    activated_at,
    customer_tier,
    account_status,
    risk_score
FROM {{ source('raw', 'raw_customers') }}
