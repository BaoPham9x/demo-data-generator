# Star Schema dbt Project

Transform raw tables → star schema

## Setup

1. **Configure BigQuery credentials:**
   ```bash
   # Option 1: Service account key file
   export GOOGLE_APPLICATION_CREDENTIALS="/path/to/service-account-key.json"
   
   # Option 2: Use gcloud auth
   gcloud auth application-default login
   ```

2. **Configure dbt profile** (`~/.dbt/profiles.yml`):
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

3. **Run dbt:**
   ```bash
   cd star-schema
   dbt deps  # Install dependencies (if any)
   dbt run   # Build all models
   dbt test  # Run tests (optional)
   ```

## Models

- **Dimensions** (direct from source): `dim_customer`, `dim_account`, `dim_date`, `dim_merchant`
- **Facts** (from source + dimensions): `fact_transactions`, `fact_subscriptions`, `fact_customer_features`, `fact_ad_spend`

## Note

You need to configure your own BigQuery credentials. The `dbt_project.yml` doesn't contain credentials - it's configured via `~/.dbt/profiles.yml` on your machine.
