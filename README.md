# Demo Data Generator

Generate realistic fintech demo data and build analytics-ready star schemas for BigQuery.

## Workflow (no direct BigQuery sync)

1. **Generate demo data locally** – run the generator (see Commands below).
2. **Upload tables to Big Query** – load the CSVs from `raw table output/` into your BigQuery dataset.
3. **Create star-schema views** – use dbt or the SQL in `star-schema-for-big-query/` to build views that limit data by date up to today, so it looks like it’s updated daily.
4. **Use in a new workspace** – Demo tables already live in the demo data project. After connecting your workspace to the demo data source, use **Steep as code** to populate all metric definitions into the workspace. That’s how you quickly set up a workspace.

## Commands

- `deno task generate` – Full dataset (5K customers, 2M+ transactions)
- `deno task sample` – Small sample (10 customers, 3 months)
- `deno task clean` – Delete all CSV files

## What’s inside

- **`data-generation/`** – Generates 8 CSV files (customers, transactions, subscriptions, etc.)
- **`raw table output/`** – CSVs ready for BigQuery upload
- **`star-schema-for-big-query/`** – dbt/SQL to build star-schema views (date-limited to today)
- **`modules/`** – Steep semantic layer YAML (metrics & dimensions) for Steep-as-code workspace setup
