# Data Generation

TypeScript/Deno code that generates 8 interconnected CSV files with realistic fintech data.

## 🚀 Usage

```bash
deno task generate   # Full dataset (5K customers, 2M+ transactions)
deno task sample     # Small sample (10 customers, 3 months)
deno task targets    # Generate targets.csv for ML/analytics
```

## 📊 Output

8 CSV files in `raw table output/`:
- Customers, accounts, transactions (with H3 geospatial indexes)
- Subscriptions, risk events, ad spend, visitors, customer features
- All with referential integrity maintained

## 🔧 Customization

Edit `generate.ts` to change:
- Customer count (`customerCount`)
- Date range (`startDate`, `endDate`)
- Or modify models in `models/fintech/` for different data structures
