# Append Remaining Balance Files

You've uploaded the first part (`raw_balances_part_aa.csv`). Here's how to add the other 2 parts:

## Method 1: BigQuery UI (Easiest)

1. **Go to your `raw_balances` table** (you're already there)
2. **Click "Edit Table"** button (top right, next to "Query")
3. **Click "Add Data"** tab
4. **Select "Upload file"**
5. **Upload `raw_balances_part_ab.csv`**
   - File format: CSV
   - Skip leading rows: 1 (to skip header)
   - Write preference: Append to table
6. **Click "Add Data"** again and repeat for `raw_balances_part_ac.csv`

---

## Method 2: SQL (Alternative)

If the UI doesn't work, you can create temporary tables and merge:

```sql
-- Upload raw_balances_part_ab.csv as a new table (temp_balances_ab)
-- Upload raw_balances_part_ac.csv as a new table (temp_balances_ac)

-- Then run this to append:
INSERT INTO `steep-demo.steep_demo_fintech.raw_balances`
SELECT * FROM `steep-demo.steep_demo_fintech.temp_balances_ab`
WHERE balance_snapshot_id NOT IN (SELECT balance_snapshot_id FROM `steep-demo.steep_demo_fintech.raw_balances`);

INSERT INTO `steep-demo.steep_demo_fintech.raw_balances`
SELECT * FROM `steep-demo.steep_demo_fintech.temp_balances_ac`
WHERE balance_snapshot_id NOT IN (SELECT balance_snapshot_id FROM `steep-demo.steep_demo_fintech.raw_balances`);
```

---

## Method 3: bq CLI (If you have it)

```bash
bq load --source_format=CSV \
  --skip_leading_rows=1 \
  --noreplace \
  steep-demo:steep_demo_fintech.raw_balances \
  output/raw_balances_part_ab.csv

bq load --source_format=CSV \
  --skip_leading_rows=1 \
  --noreplace \
  steep-demo:steep_demo_fintech.raw_balances \
  output/raw_balances_part_ac.csv
```

---

## Verify After Upload

Run this query to check total rows (should be ~3.69M):

```sql
SELECT COUNT(*) as total_rows 
FROM `steep-demo.steep_demo_fintech.raw_balances`;
```

Expected: **3,692,620 rows** (including header, so 3,692,619 data rows)
