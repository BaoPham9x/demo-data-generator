# BigQuery View Creation Guide

## Overview

All SQL files in `models/marts/` are ready to be used as BigQuery views. They reference raw tables directly using the format:
```
`steep-demo.steep_demo_fintech.raw_*`
```

## Table Structure

### Raw Tables (uploaded to BigQuery)
- `steep-demo.steep_demo_fintech.raw_customers`
- `steep-demo.steep_demo_fintech.raw_accounts`
- `steep-demo.steep_demo_fintech.raw_transactions`
- `steep-demo.steep_demo_fintech.raw_ad_spend`
- `steep-demo.steep_demo_fintech.raw_visitors`
- `steep-demo.steep_demo_fintech.raw_subscriptions`
- `steep-demo.steep_demo_fintech.raw_customer_features`
- `steep-demo.steep_demo_fintech.raw_risk_events`
- `steep-demo.steep_demo_fintech.raw_balances` (may have split files)

### Dimension Views (create first)
1. `dim_date` - Date dimension
2. `dim_customer` - Customer master data
3. `dim_account` - Account master data
4. `dim_merchant` - Merchant dimension (from transactions)
5. `dim_risk_event_type` - Risk event types

### Fact Views (create after dimensions)
1. `fact_ad_spend` - Marketing ad spend
2. `fact_visitors` - Daily aggregated visitor metrics
3. `fact_transactions` - All transactions
4. `fact_customer_features` - Customer feature usage
5. `fact_subscriptions` - Subscription data
6. `fact_risk_events` - Risk events
7. `fact_balances` - Account balance snapshots
8. `fact_campaign_roi` - Pre-joined ad_spend + visitors for ROI analysis

## Common Dimensions Available

### Country (available in multiple tables)
- `fact_transactions.country`
- `fact_ad_spend.country`
- `fact_visitors.country`
- `dim_customer.country`

### Network/Channel (marketing dimensions)
- `fact_ad_spend.network`, `fact_ad_spend.channel`
- `fact_visitors.network`, `fact_visitors.channel`

### Customer Dimensions (via joinPaths)
- `dim_customer.customer_tier` - Available in transactions, subscriptions, etc.
- `dim_customer.registration_source` - Available in transactions, customers
- `dim_customer.country` - Available across all customer-related facts

## How to Create Views

1. **Copy SQL from each `.sql` file**
2. **Remove the comment line** (e.g., `-- Create as view: CREATE OR REPLACE VIEW...`)
3. **Wrap with CREATE OR REPLACE VIEW**:
   ```sql
   CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_customer` AS
   -- paste SQL here
   ```

4. **Create in order**:
   - First: All dimension views
   - Then: Fact views (they reference dimensions)

## Example

```sql
-- Create dim_customer view
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_customer` AS
SELECT
    customer_id as customer_key,
    customer_id,
    first_name,
    -- ... rest of SQL from dim_customer.sql
FROM `steep-demo.steep_demo_fintech.raw_customers`;
```

## Notes

- All views use `SAFE_DIVIDE` for division to avoid errors
- Views filter out future dates (`<= CURRENT_DATE()`)
- `fact_campaign_roi` is optional but useful for ROI analysis
- If balances are split, update `fact_balances.sql` to UNION ALL the split files
