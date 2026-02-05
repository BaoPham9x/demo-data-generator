# Star Schema for BigQuery

dbt models to transform raw CSV tables into analytics-ready star schema.

## 🚀 Quick Setup

1. **Upload CSVs** to BigQuery (from `raw table output/`)
2. **Configure dbt** profile with BigQuery credentials
3. **Run dbt**: `cd star-schema-for-big-query && dbt run`

## 📊 Output

**Dimensions**: `dim_date`, `dim_customer`, `dim_account`, `dim_merchant`, `dim_risk_event_type`

**Facts**: `fact_transactions`, `fact_subscriptions`, `fact_customer_features`, `fact_ad_spend`, `fact_visitors`, `fact_risk_events`, `fact_agg_arr`

## 🔄 Alternative

Create BigQuery views manually by copying SQL from `models/marts/` files. Create dimensions first, then facts.
