# Demo Data Generator

Generate realistic fintech demo data and build analytics-ready star schemas for BigQuery.

## 🚀 Quick Start

```bash
# Generate data (5,000 customers, 2M+ transactions)
deno task generate

# Or small sample for testing
deno task sample

# Launch metric alerts GUI
deno task alerts-gui
```

## 📁 What's Inside

- **`data-generation/`** - Code to generate 8 CSV files (customers, transactions, subscriptions, etc.)
- **`raw table output/`** - Generated CSV files ready for BigQuery
- **`star-schema-for-big-query/`** - dbt models to transform raw data into star schema
- **`modules/`** - Steep semantic layer YAML files (metrics & dimensions)
- **`alerts-prototype/`** - Web-based alert system for monitoring Steep metrics

## 🛠️ Commands

- `deno task generate` - Full dataset (5K customers, 2M+ transactions)
- `deno task sample` - Small sample (10 customers, 3 months)
- `deno task alerts-gui` - Launch alerts web interface
- `deno task check-alerts` - Run alerts from CLI
- `deno task clean` - Delete all CSV files

## 📊 Generated Data

8 interconnected CSV files with referential integrity:
- Customers, accounts, transactions (with H3 geospatial indexes)
- Subscriptions, risk events, ad spend, visitors, customer features
- Date range: 2024-2026 (3 years)

## 📚 More Info

Each folder has a short README with specific instructions. Start with the main commands above!
