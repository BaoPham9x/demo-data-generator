# Demo Data Generator

Generate fintech demo data → Star Schema → Steep Semantic Layer

## Run It

```bash
# Install Deno (one time)
curl -fsSL https://deno.land/install.sh | sh
export PATH="$HOME/.deno/bin:$PATH"

# Generate sample (10 customers, fast)
deno task sample

# Generate full dataset (5,000 customers, 2M transactions)
deno task generate
```

Output: CSV files in `./output/`

## Features

### H3 Geospatial Indexing
- `raw_transactions.csv` includes H3 geospatial indexes (resolutions 1-10) for transactions with location data
- H3 is **pre-computed during data generation** to avoid BigQuery H3 function limitations
- Only transactions with latitude/longitude (≈70% of card_spend and payment transactions) have H3 indexes


## Structure

```
demo-data-generator/
├── src/              # Generation code
├── output/           # Generated CSVs
├── star-schema/      # dbt models (raw → star schema)
└── modules/          # Steep YAML files
```

## Workflow

1. **Generate** → `deno task generate` (creates CSVs)
   - All data is generated together to maintain referential integrity
   - Transactions include H3 indexes for location data
2. **Load to BigQuery** → Manually upload CSVs to `demo_raw` dataset
3. **Transform** → Run `dbt run` in `star-schema/` (creates star schema)
4. **Semantic Layer** → Use Steep modules in `modules/` (references star schema)

## Remake Everything

**What `clean` does:** Deletes local CSV files in `./output/` directory (does NOT touch BigQuery)

**To remake everything:**
```bash
# 1. Clean local CSVs and regenerate
deno task clean && deno task generate

# 2. Manually reload to BigQuery (delete old tables, upload new CSVs)

# 3. Manually run dbt
cd star-schema && dbt run

# 4. Steep modules stay the same (no update needed)
```

**Note:** Since you manually upload to BigQuery, you need to manually delete/reload tables there too.
