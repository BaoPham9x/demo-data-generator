# Demo Data Generator

Generate realistic fintech demo data with 8 interconnected tables, then transform to a star schema for analytics.

## Quick Start

### Step 1: Install Deno (one-time setup)

```bash
curl -fsSL https://deno.land/install.sh | sh
export PATH="$HOME/.deno/bin:$PATH"
```

### Step 2: Generate Data

```bash
# Test with small sample (10 customers, fast)
deno task sample

# Or generate full dataset (5,000 customers, 2M+ transactions)
deno task generate
```

That's it! CSV files will be in the `./output/` directory.

## What Gets Generated

The generator creates 8 CSV files with realistic fintech data (2024-2026):

1. **raw_customers.csv** - 5,000 customers with demographics, risk scores, tiers
2. **raw_accounts.csv** - Multiple accounts per customer (checking, savings, etc.)
3. **raw_transactions.csv** - 2M+ financial transactions (card_spend, payments, transfers) with H3 geospatial indexes
4. **raw_subscriptions.csv** - SaaS subscription data with MRR/ARR
5. **raw_customer_features.csv** - Product feature usage and activations
6. **raw_risk_events.csv** - Risk and fraud events
7. **raw_ad_spend.csv** - Marketing ad spend by date, country, network, channel
8. **raw_visitors.csv** - Website visitor sessions with conversion tracking

All tables maintain referential integrity (foreign keys are valid).

## Next Steps: Load to BigQuery

### Option A: Use dbt (Recommended)

1. **Upload CSVs to BigQuery:**
   - Create a dataset (e.g., `demo_raw`)
   - Upload all 8 CSV files as tables

2. **Setup dbt:**
   ```bash
   # Configure BigQuery credentials
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   # OR
   gcloud auth application-default login
   ```

3. **Configure dbt profile** (`~/.dbt/profiles.yml`):
   ```yaml
   demo_fintech:
     outputs:
       dev:
         type: bigquery
         method: service-account
         keyfile: /path/to/service-account-key.json
         project: your-project-id
         dataset: demo_fintech
         location: US
     target: dev
   ```

4. **Run dbt:**
   ```bash
   cd star-schema
   dbt run
   ```

This creates a star schema with:
- **Dimensions:** `dim_date`, `dim_customer`, `dim_account`, `dim_merchant`, `dim_risk_event_type`
- **Facts:** `fact_transactions`, `fact_subscriptions`, `fact_customer_features`, `fact_ad_spend`, `fact_visitors`, `fact_risk_events`, `fact_agg_arr`

### Option B: Create BigQuery Views

If you prefer views instead of dbt tables:

1. Upload CSVs to BigQuery (same as above)

2. For each SQL file in `star-schema/models/marts/`:
   - Copy the SQL content
   - Remove the comment line at the top
   - Wrap with `CREATE OR REPLACE VIEW`:
   ```sql
   CREATE OR REPLACE VIEW `your-project.your-dataset.dim_customer` AS
   -- paste SQL here
   ```

3. **Create in order:**
   - First: All dimension views (`dim_date`, `dim_customer`, `dim_account`, `dim_merchant`, `dim_risk_event_type`)
   - Then: Fact views (they reference dimensions)

## Available Commands

- `deno task sample` - Generate small sample (10 customers, 3 months) for testing
- `deno task generate` - Generate full dataset (5,000 customers, 3 years)
- `deno task targets` - Generate targets.csv for ML/analytics use cases
- `deno task clean` - Delete all CSV files in `./output/` directory

## Features

### H3 Geospatial Indexing
- Transactions include H3 geospatial indexes (resolutions 1-10) for location data
- Pre-computed during generation (no BigQuery H3 function needed)
- Only transactions with lat/lng (≈70% of card_spend and payment transactions) have H3 indexes

### Data Quality
- All foreign keys are valid (referential integrity maintained)
- Data generated in correct order to ensure relationships are consistent
- Date range: 2024-01-01 to 2026-12-31 (3 years)

## Project Structure

```
demo-data-generator/
├── src/              # Generation code
│   ├── models/       # Table model definitions
│   └── lib/          # Utility functions
├── output/           # Generated CSVs (created when you run generate)
├── star-schema/      # dbt models (raw → star schema)
│   └── models/marts/ # Dimension and fact SQL files
└── modules/          # Semantic layer YAML files (optional)
```

## Regenerate Everything

To start fresh:

```bash
# 1. Clean local CSVs and regenerate
deno task clean && deno task generate

# 2. Manually reload to BigQuery (delete old tables, upload new CSVs)

# 3. If using dbt, run it again
cd star-schema && dbt run
```

## Need Help?

- Check the CSV files in `./output/` to see the data structure
- All SQL files are in `star-schema/models/marts/` if you want to customize
- The generator maintains referential integrity automatically
