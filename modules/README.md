# Steep Semantic Layer Modules

YAML files defining metrics, dimensions, and entities for Steep.

## 📊 Modules

Each YAML file defines a module with metrics and dimensions:
- `accounts.yaml`, `ad_spend.yaml`, `agg_arr.yaml`
- `customer_features.yaml`, `customers.yaml`, `risk_events.yaml`
- `subscriptions.yaml`, `transactions.yaml`, `visitors.yaml`

## 🚀 Usage

1. **Import to Steep** - Upload YAML files or copy/paste into Steep UI
2. **Connect to BigQuery** - Point Steep to your dataset
3. **Use Metrics** - Query via API, build dashboards, create alerts

## 📝 Structure

Each module defines:
- `metrics` - Calculations (sum, count, custom SQL)
- `dimensions` - Filtering/grouping fields
- `joinPaths` - Relationships between tables

Edit YAML files to customize metrics and dimensions.
