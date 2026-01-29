-- Fact: Ad Spend
SELECT
    a.ad_spend_id,
    a.network,
    a.channel,
    a.campaign_name,
    a.country,
    a.currency,
    a.amount,
    a.conversions,
    a.created_at
FROM {{ source('raw', 'raw_ad_spend') }} a
WHERE DATE(a.created_at) <= CURRENT_DATE()