# Star Schema for BigQuery

dbt/SQL to turn raw tables into star-schema **views** that limit data by date up to today (so it looks updated daily).

**Steps:** Upload CSVs from `raw table output/` to BigQuery → set dbt profile → run `dbt run` from this folder. Or copy SQL from `models/marts/` and create views manually (dimensions first, then facts).

**Output:** Dimensions (`dim_date`, `dim_customer`, `dim_account`, …) and facts (`fact_transactions`, `fact_subscriptions`, …).
