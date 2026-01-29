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
2. **Load to BigQuery** → Upload CSVs to `demo_raw` dataset
3. **Transform** → Run `dbt run` in `star-schema/` (creates star schema)
4. **Semantic Layer** → Use Steep modules in `modules/` (references star schema)

## Remake Everything

```bash
deno task clean && deno task generate
# Then reload BigQuery, run dbt, update Steep
```
