# Module Review Checklist

## ✅ All Modules Reference Correct Schema
- All 8 modules use: `schema: "demo_fintech"`

## ✅ Table References
All modules correctly reference star schema tables:
- `dim_customer`
- `dim_account`
- `fact_transactions`
- `fact_subscriptions`
- `fact_customer_features`
- `fact_balances`
- `fact_risk_events`
- `fact_ad_spend`

## ✅ Fixed Issues
1. **risk_events.yaml**: Changed `transaction_key` → `transaction_id` join
2. **accounts.yaml**: Changed `customer_id` → `customer_key` join
3. **fact_transactions.sql**: Added `merchant_name` and `merchant_category` columns

## 📋 Module List
1. `customers.yaml` - dim_customer
2. `accounts.yaml` - dim_account
3. `transactions.yaml` - fact_transactions
4. `subscriptions.yaml` - fact_subscriptions
5. `customer_features.yaml` - fact_customer_features
6. `balances.yaml` - fact_balances
7. `risk_events.yaml` - fact_risk_events
8. `ad_spend.yaml` - fact_ad_spend

## ⚠️ Before Syncing
1. Verify all dim/fact tables exist in BigQuery as views in `demo_fintech` schema
2. Run `dbt run` if you haven't already to create the views
3. Test a few queries to ensure joins work correctly

## 🔗 Join Paths Verified
- All joinPaths use `customer_key`, `account_key`, `transaction_id` correctly
- All referenced tables exist in star schema
