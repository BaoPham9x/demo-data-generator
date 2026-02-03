/**
 * Generate Targets CSV for Steep
 * 
 * Creates a target table with targets for 2025-2026 (24 months)
 * Format: series | metric | time | dimension columns | value | numerator | denominator
 */

import { stringify } from "jsr:@std/csv";

type TargetRow = {
  series: string;
  metric: string;
  time: string; // YYYY-MM-DD
  country: string | null;
  currency: string | null;
  network: string | null;
  value: number | null;
  numerator: number | null;
  denominator: number | null;
};

const csvColumns = [
  "series",
  "metric",
  "time",
  "country",
  "currency",
  "network",
  "value",
  "numerator",
  "denominator",
];

function addMonths(date: Date, months: number): Date {
  const result = new Date(date);
  result.setMonth(result.getMonth() + months);
  return result;
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = "01";
  return `${year}-${month}-${day}`;
}

function generateMonthlyTargets(): TargetRow[] {
  const targets: TargetRow[] = [];
  const startDate = new Date("2025-01-01");
  
  // Generate 24 months (2025-2026)
  for (let month = 0; month < 24; month++) {
    const date = addMonths(startDate, month);
    const timeStr = formatDate(date);
    const monthNum = month + 1;
    
    // Base growth factors
    const baseGrowth = 1 + (monthNum * 0.05); // 5% growth per month
    const revenueGrowth = 1 + (monthNum * 0.08); // 8% growth for revenue
    
    // Transaction Volume - Overall
    // Target is ~90% of actual (actual daily ~1.3M-2.3M, monthly ~39M-69M, target ~35M-62M)
    targets.push({
      series: "Target",
      metric: "transaction_volume",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(40000000 * baseGrowth * 0.9), // ~90% of actual
      numerator: null,
      denominator: null,
    });
    
    // Transaction Volume - US
    targets.push({
      series: "Target",
      metric: "transaction_volume",
      time: timeStr,
      country: "US",
      currency: null,
      network: null,
      value: Math.round(24000000 * baseGrowth * 0.9), // ~60% of overall, ~90% of actual
      numerator: null,
      denominator: null,
    });
    
    // Transaction Volume - GB
    targets.push({
      series: "Target",
      metric: "transaction_volume",
      time: timeStr,
      country: "GB",
      currency: null,
      network: null,
      value: Math.round(6400000 * baseGrowth * 0.9), // ~16% of overall, ~90% of actual
      numerator: null,
      denominator: null,
    });
    
    // Revenue - Overall
    // Target is ~90% of actual (actual daily ~1.4M-2.3M, monthly ~42M-69M, target ~38M-62M)
    targets.push({
      series: "Target",
      metric: "revenue",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(45000000 * revenueGrowth * 0.9), // ~90% of actual
      numerator: null,
      denominator: null,
    });
    
    // Revenue - US
    targets.push({
      series: "Target",
      metric: "revenue",
      time: timeStr,
      country: "US",
      currency: null,
      network: null,
      value: Math.round(27000000 * revenueGrowth * 0.9), // ~60% of overall, ~90% of actual
      numerator: null,
      denominator: null,
    });
    
    // Total Ad Spend - Overall
    targets.push({
      series: "Target",
      metric: "total_ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(100000 * baseGrowth),
      numerator: null,
      denominator: null,
    });
    
    // Total Ad Spend - Google
    targets.push({
      series: "Target",
      metric: "total_ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: "google",
      value: Math.round(60000 * baseGrowth),
      numerator: null,
      denominator: null,
    });
    
    // Total Ad Spend - Meta (Facebook)
    targets.push({
      series: "Target",
      metric: "total_ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: "meta",
      value: Math.round(40000 * baseGrowth),
      numerator: null,
      denominator: null,
    });
    
    // Total Customers - Overall
    targets.push({
      series: "Target",
      metric: "total_customers",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(500 + (monthNum * 50)),
      numerator: null,
      denominator: null,
    });
    
    // Total Customers - US
    targets.push({
      series: "Target",
      metric: "total_customers",
      time: timeStr,
      country: "US",
      currency: null,
      network: null,
      value: Math.round(300 + (monthNum * 30)),
      numerator: null,
      denominator: null,
    });
    
    // Success Rate (Ratio metric) - Overall
    const successRate = 0.95 + (monthNum * 0.001); // Gradually improving
    targets.push({
      series: "Target",
      metric: "success_rate",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: null,
      numerator: Math.round(100000 * successRate),
      denominator: 100000,
    });
    
    // Success Rate - US
    targets.push({
      series: "Target",
      metric: "success_rate",
      time: timeStr,
      country: "US",
      currency: null,
      network: null,
      value: null,
      numerator: Math.round(60000 * successRate),
      denominator: 60000,
    });
  }
  
  return targets;
}

// Generate and write CSV
const targets = generateMonthlyTargets();
const csv = stringify(targets, { columns: csvColumns, headers: true });

Deno.writeTextFileSync("output/targets.csv", csv);

console.log(`✅ Generated targets.csv with ${targets.length} rows`);
console.log(`   - 24 months (Jan 2025 - Dec 2026)`);
console.log(`   - Series: Target`);
console.log(`   - Metrics: transaction_volume, revenue, total_ad_spend, total_customers, success_rate`);
console.log(`   - Dimensions: country (US, GB), network (google, meta)`);
