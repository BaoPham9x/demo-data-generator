-- Fact: Ad Spend
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.fact_ad_spend AS
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
FROM `steep-demo.steep_demo_fintech.raw_ad_spend` a
WHERE DATE(a.created_at) <= CURRENT_DATE()
