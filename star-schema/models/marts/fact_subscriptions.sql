-- Fact: Subscriptions
SELECT
    s.subscription_id,
    dc.customer_key,
    dd.date_key,
    s.plan_name,
    s.monthly_price,
    s.currency,
    s.status,
    s.billing_cycle,
    s.mrr,
    s.arr,
    s.started_at,
    s.ended_at,
    s.created_at
FROM {{ source('raw', 'raw_subscriptions') }} s
LEFT JOIN {{ ref('dim_customer') }} dc ON s.customer_id = dc.customer_id
LEFT JOIN {{ ref('dim_date') }} dd ON DATE(s.started_at) = dd.date
