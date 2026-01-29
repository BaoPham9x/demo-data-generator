-- Fact: Ad Spend
SELECT
    a.ad_spend_id,
    dd.date_key,
    a.network,
    a.channel,
    a.campaign_name,
    a.country,
    a.currency,
    a.amount,
    a.conversions,
    a.created_at
FROM {{ source('raw', 'raw_ad_spend') }} a
LEFT JOIN {{ ref('dim_date') }} dd ON DATE(a.created_at) = dd.date
