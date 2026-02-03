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
    
    // Ad Spend - Overall (changed from total_ad_spend to ad_spend)
    // Target is randomly 90% or 120% of actual (~100k monthly base)
    const adSpendMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    targets.push({
      series: "Target",
      metric: "ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(100000 * baseGrowth * adSpendMultiplier),
      numerator: null,
      denominator: null,
    });
    
    // Ad Spend - Google
    const googleMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    targets.push({
      series: "Target",
      metric: "ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: "google",
      value: Math.round(60000 * baseGrowth * googleMultiplier),
      numerator: null,
      denominator: null,
    });
    
    // Ad Spend - Meta (Facebook)
    const metaMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    targets.push({
      series: "Target",
      metric: "ad_spend",
      time: timeStr,
      country: null,
      currency: null,
      network: "meta",
      value: Math.round(40000 * baseGrowth * metaMultiplier),
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
    
    // Total ARR - Overall
    // Estimated: ~2400 active subscriptions * ~$905 ARR/subscription = ~$2.17M ARR
    // With growth: base ARR grows with customer base
    // Target is randomly 90% or 120% of actual
    const arrMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    const arrGrowth = 1 + (monthNum * 0.03); // 3% ARR growth per month
    const baseARR = 2170000; // ~$2.17M base ARR
    targets.push({
      series: "Target",
      metric: "total_arr",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(baseARR * arrGrowth * arrMultiplier),
      numerator: null,
      denominator: null,
    });
    
    // Total ARR - US (assuming ~60% of customers are US)
    const arrUSMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    targets.push({
      series: "Target",
      metric: "total_arr",
      time: timeStr,
      country: "US",
      currency: null,
      network: null,
      value: Math.round(baseARR * 0.6 * arrGrowth * arrUSMultiplier),
      numerator: null,
      denominator: null,
    });
    
    // MRR - Overall (ARR / 12)
    // Target is randomly 90% or 120% of actual
    const mrrMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    const baseMRR = baseARR / 12; // ~$181k MRR
    targets.push({
      series: "Target",
      metric: "mrr",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round(baseMRR * arrGrowth * mrrMultiplier),
      numerator: null,
      denominator: null,
    });
    
    // Active Subscriptions - Overall
    // Estimated: ~2400 active subscriptions, growing with customer base
    // Target is randomly 90% or 120% of actual
    const subsMultiplier = Math.random() < 0.5 ? 0.9 : 1.2;
    const baseSubscriptions = 2400;
    targets.push({
      series: "Target",
      metric: "active_subscriptions",
      time: timeStr,
      country: null,
      currency: null,
      network: null,
      value: Math.round((baseSubscriptions + (monthNum * 20)) * subsMultiplier),
      numerator: null,
      denominator: null,
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
console.log(`   - Metrics: transaction_volume, revenue, ad_spend, total_customers, success_rate, total_arr, mrr, active_subscriptions`);
console.log(`   - Dimensions: country (US, GB), network (google, meta)`);
console.log(`   - Targets are randomly 90% or 120% of estimated actual values`);