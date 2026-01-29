-- Staging model: Clean and standardize raw subscriptions
SELECT
    subscription_id,
    customer_id,
    created_at,
    started_at,
    ended_at,
    plan_name,
    monthly_price,
    currency,
    status,
    billing_cycle,
    billing_paused_at,
    suspended_at,
    mrr,
    arr
FROM {{ source('raw', 'raw_subscriptions') }}
