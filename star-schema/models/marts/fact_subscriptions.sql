-- Fact: Subscriptions
SELECT
    s.subscription_id,
    dc.customer_key,
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
WHERE DATE(s.started_at) <= CURRENT_DATE()