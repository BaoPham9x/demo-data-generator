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
