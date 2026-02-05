-- Example: Campaign ROI Analysis (BigQuery)
-- Join fact_ad_spend to fact_visitors to calculate ROI per campaign
-- Replace 'your-project.your-dataset' with your actual project and dataset

SELECT 
  DATE(a.created_at) as date,
  a.network,
  a.channel,
  a.campaign_name,
  a.country,
  
  -- Ad Spend Metrics
  a.amount as ad_spend,
  
  -- Visitor Metrics
  v.total_visitors,
  v.total_sessions,
  v.total_conversions,
  v.total_page_views,
  
  -- ROI Calculations
  ROUND(a.amount / NULLIF(v.total_conversions, 0), 2) as cost_per_conversion,
  ROUND((v.total_conversions / NULLIF(v.total_visitors, 0) * 100), 2) as conversion_rate_pct,
  
  -- Revenue (assuming $100 per conversion - adjust based on your business)
  v.total_conversions * 100 as estimated_revenue,
  ROUND((v.total_conversions * 100 - a.amount), 2) as estimated_profit,
  ROUND(((v.total_conversions * 100 - a.amount) / NULLIF(a.amount, 0) * 100), 2) as roi_pct
  
FROM `your-project.your-dataset.fact_ad_spend` a
INNER JOIN `your-project.your-dataset.fact_visitors` v 
  ON DATE(a.created_at) = v.visitor_date
  AND a.network = v.network
  AND a.channel = v.channel
  AND a.country = v.country
  AND COALESCE(a.campaign_name, '') = COALESCE(v.campaign_name, '')
  
WHERE a.campaign_name IS NOT NULL  -- Only campaigns with names
  
ORDER BY a.created_at DESC, a.amount DESC;

-- Summary by Campaign
SELECT 
  a.campaign_name,
  a.network,
  COUNT(*) as days_active,
  SUM(a.amount) as total_ad_spend,
  SUM(v.total_visitors) as total_visitors,
  SUM(v.total_conversions) as total_conversions,
  ROUND(SUM(v.total_conversions) / NULLIF(SUM(v.total_visitors), 0) * 100, 2) as overall_conversion_rate,
  ROUND(SUM(a.amount) / NULLIF(SUM(v.total_conversions), 0), 2) as avg_cost_per_conversion,
  SUM(v.total_conversions) * 100 as estimated_revenue,
  ROUND(SUM(v.total_conversions) * 100 - SUM(a.amount), 2) as estimated_profit,
  ROUND(((SUM(v.total_conversions) * 100 - SUM(a.amount)) / NULLIF(SUM(a.amount), 0) * 100), 2) as roi_pct
FROM `your-project.your-dataset.fact_ad_spend` a
INNER JOIN `your-project.your-dataset.fact_visitors` v 
  ON DATE(a.created_at) = v.visitor_date
  AND a.network = v.network
  AND a.channel = v.channel
  AND a.country = v.country
  AND COALESCE(a.campaign_name, '') = COALESCE(v.campaign_name, '')
WHERE a.campaign_name IS NOT NULL
GROUP BY a.campaign_name, a.network
ORDER BY estimated_profit DESC;
