-- Fact: Visitors (Daily Aggregated)
-- Daily aggregated website visitor metrics for conversion analysis
-- Can be joined to fact_ad_spend for ROI analysis
-- Create as view: CREATE OR REPLACE VIEW steep-demo.steep_demo_fintech.fact_visitors AS
SELECT
    v.visitor_date,
    dd.date_key,
    v.network,
    v.channel,
    v.country,
    v.campaign_name,
    
    -- Aggregated metrics
    v.total_sessions,
    v.total_visitors,
    v.total_conversions,
    v.total_page_views,
    v.avg_time_on_site_seconds,
    
    -- Calculated metrics (for convenience)
    ROUND(SAFE_DIVIDE(v.total_conversions, v.total_visitors) * 100, 2) as conversion_rate_pct,
    ROUND(SAFE_DIVIDE(v.total_page_views, v.total_sessions), 2) as avg_page_views_per_session
    
FROM `steep-demo.steep_demo_fintech.raw_visitors` v
LEFT JOIN `steep-demo.steep_demo_fintech.dim_date` dd ON v.visitor_date = dd.date
WHERE v.visitor_date <= CURRENT_DATE()
