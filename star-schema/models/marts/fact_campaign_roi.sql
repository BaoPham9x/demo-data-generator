-- Fact: Campaign ROI Analysis
-- Joins ad_spend with visitors to calculate ROI per campaign
-- This view enables campaign performance analysis and ROI calculations
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.fact_campaign_roi AS
SELECT
    COALESCE(DATE(a.created_at), v.visitor_date) as date,
    dd.date_key,
    
    -- Campaign dimensions
    a.network,
    a.channel,
    a.campaign_name,
    a.country,
    a.currency,
    
    -- Ad Spend metrics
    a.ad_spend_id,
    a.amount as ad_spend_amount,
    a.conversions as ad_spend_conversions,
    
    -- Visitor metrics
    v.total_sessions,
    v.total_visitors,
    v.total_conversions as visitor_conversions,
    v.total_page_views,
    v.avg_time_on_site_seconds,
    v.conversion_rate_pct,
    
    -- ROI calculations
    ROUND(SAFE_DIVIDE(a.amount, v.total_conversions), 2) as cost_per_conversion,
    ROUND(SAFE_DIVIDE(v.total_conversions, v.total_visitors) * 100, 2) as visitor_conversion_rate_pct,
    
    -- Revenue calculations (adjust multiplier based on your business)
    -- Assuming $100 per conversion - modify as needed
    v.total_conversions * 100 as estimated_revenue,
    ROUND((v.total_conversions * 100 - a.amount), 2) as estimated_profit,
    ROUND(SAFE_DIVIDE((v.total_conversions * 100 - a.amount), a.amount) * 100, 2) as roi_pct
    
FROM `steep-demo.steep_demo_fintech.fact_ad_spend` a
INNER JOIN `steep-demo.steep_demo_fintech.fact_visitors` v 
    ON DATE(a.created_at) = v.visitor_date
    AND a.network = v.network
    AND a.channel = v.channel
    AND a.country = v.country
    AND COALESCE(a.campaign_name, '') = COALESCE(v.campaign_name, '')
LEFT JOIN `steep-demo.steep_demo_fintech.dim_date` dd ON DATE(a.created_at) = dd.date
WHERE a.campaign_name IS NOT NULL  -- Only campaigns with names for ROI analysis
    AND DATE(a.created_at) <= CURRENT_DATE()
