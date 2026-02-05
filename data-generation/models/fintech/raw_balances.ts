/**
 * Raw Balances Table
 * 
 * Daily account balance snapshots (time series)
 * Estimated: ~8,000,000 rows (daily snapshots for 3 years)
 * 
 * This creates a time-series dataset perfect for:
 * - Balance trends over time
 * - Average balance calculations
 * - Balance distribution analysis
 * - Account growth metrics
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import { addDays, randomAmount, randomFloatBetween } from "../../lib/random.ts";

export type RawBalance = {
  balance_snapshot_id: string;
  account_id: string; // FK → raw_accounts.account_id
  balance_date: string; // Date (YYYY-MM-DD)
  balance_amount: number;
  currency: string;
  created_at: string; // Timestamp when snapshot was taken
};

const csvColumns: Column[] = [
  "balance_snapshot_id",
  "account_id",
  "balance_date",
  "balance_amount",
  "currency",
  "created_at",
];

/**
 * Convert balances array to CSV string
 */
export function balancesToCsv(data: RawBalance[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Generate daily balance snapshots for an account
 */
export function generateAccountBalances(
  accountId: string,
  accountCreatedAt: Date,
  accountCurrency: string,
  initialBalance: number,
  endDate: Date
): RawBalance[] {
  const balances: RawBalance[] = [];
  const startDate = accountCreatedAt;
  
  // Generate daily snapshots from account creation to end date
  let currentDate = new Date(startDate);
  let currentBalance = initialBalance;
  
  while (currentDate <= endDate) {
    // Simulate balance changes (small random variations)
    // In reality, balance would change based on transactions
    // For demo, we'll add small random variations
    const dailyChange = randomFloatBetween(-500, 1000);
    currentBalance = Math.max(0, currentBalance + dailyChange);
    
    // Create snapshot at end of day
    const snapshotDate = new Date(currentDate);
    snapshotDate.setHours(23, 59, 59, 999);
    
    balances.push({
      balance_snapshot_id: generateId(),
      account_id: accountId,
      balance_date: currentDate.toISOString().split('T')[0], // YYYY-MM-DD
      balance_amount: Math.round(currentBalance * 100) / 100,
      currency: accountCurrency,
      created_at: snapshotDate.toISOString(),
    });
    
    // Move to next day
    currentDate = addDays(currentDate, 1);
  }
  
  return balances;
}
