-- Staging model: Clean and standardize raw ad spend
SELECT
    ad_spend_id,
    created_at,
    network,
    channel,
    campaign_name,
    country,
    currency,
    amount,
    conversions
FROM {{ source('raw', 'raw_ad_spend') }}
