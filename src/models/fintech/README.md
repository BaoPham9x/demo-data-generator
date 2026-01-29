# Fintech Raw Tables

This directory contains the model definitions for generating raw fintech tables.

## Files

- `raw_customers.ts` - Customer master data
- `raw_accounts.ts` - Customer accounts
- `raw_transactions.ts` - Financial transactions (TODO)
- `raw_subscriptions.ts` - SaaS subscriptions (TODO)
- `raw_customer_features.ts` - Product feature activations (TODO)
- `raw_ad_spend.ts` - Marketing ad spend (TODO)

## Implementation Status

- ✅ `raw_customers.ts` - Structure defined, needs generation logic
- ✅ `raw_accounts.ts` - Structure defined, needs generation logic
- ⏳ Other tables - To be implemented

Each file should export:
- Type definition for the table row
- `toCsv()` function to convert array to CSV string
- `generate*()` function(s) to create individual rows
