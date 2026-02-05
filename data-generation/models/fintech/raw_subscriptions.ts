/**
 * Raw Subscriptions Table
 * 
 * SaaS subscription events (MRR tracking)
 * Estimated: ~8,000 subscription events
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomDateBetween,
  addDays,
  randomIntBetween,
  randomAmount,
} from "../../lib/random.ts";

export type RawSubscription = {
  subscription_id: string;
  customer_id: string; // FK → raw_customers.customer_id
  created_at: string;
  started_at: string;
  ended_at: string | null;
  plan_name: string;
  monthly_price: number;
  currency: string;
  status: string;
  billing_cycle: string;
  billing_paused_at: string | null;
  suspended_at: string | null;
  mrr: number;
  arr: number;
};

const csvColumns: Column[] = [
  "subscription_id",
  "customer_id",
  "created_at",
  "started_at",
  "ended_at",
  "plan_name",
  "monthly_price",
  "currency",
  "status",
  "billing_cycle",
  "billing_paused_at",
  "suspended_at",
  "mrr",
  "arr",
];

/**
 * Convert subscriptions array to CSV string
 */
export function subscriptionsToCsv(data: RawSubscription[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Subscription plan definitions
 */
const PLANS = [
  { name: "free", monthlyPrice: 0, weight: 40 },
  { name: "starter", monthlyPrice: 29, weight: 20 },
  { name: "pro", monthlyPrice: 99, weight: 25 },
  { name: "enterprise", monthlyPrice: 299, weight: 15 },
];

/**
 * Generate subscription for a customer
 */
export function generateSubscription(
  customerId: string,
  customerCreatedAt: Date,
  endDate: Date,
  currency: string
): RawSubscription | null {
  // 60% of customers have subscriptions
  if (Math.random() > 0.60) {
    return null;
  }
  
  // Pick plan (weighted)
  const totalWeight = PLANS.reduce((sum, p) => sum + p.weight, 0);
  let random = Math.random() * totalWeight;
  let selectedPlan = PLANS[PLANS.length - 1];
  for (const plan of PLANS) {
    random -= plan.weight;
    if (random <= 0) {
      selectedPlan = plan;
      break;
    }
  }
  
  // Subscription created after customer (within 0-90 days)
  const subscriptionCreatedAt = addDays(
    customerCreatedAt,
    randomIntBetween(0, 90)
  );
  
  // Started at creation or slightly after
  const startedAt = addDays(
    subscriptionCreatedAt,
    randomIntBetween(0, 3)
  );
  
  // Billing cycle: 80% monthly, 20% annual
  const billingCycle = Math.random() < 0.80 ? "monthly" : "annual";
  const monthlyPrice = selectedPlan.monthlyPrice;
  const mrr = billingCycle === "annual" ? monthlyPrice / 12 : monthlyPrice;
  const arr = mrr * 12;
  
  // Status: Most active, some cancelled/suspended
  let status: string = "active";
  let endedAt: string | null = null;
  let billingPausedAt: string | null = null;
  let suspendedAt: string | null = null;
  
  if (Math.random() < 0.20) {
    // 20% are cancelled
    status = "cancelled";
    endedAt = randomDateBetween(startedAt, endDate).toISOString();
  } else if (Math.random() < 0.05) {
    // 5% are suspended
    status = "suspended";
    suspendedAt = randomDateBetween(startedAt, endDate).toISOString();
  } else if (Math.random() < 0.03) {
    // 3% are past_due
    status = "past_due";
  } else if (Math.random() < 0.02) {
    // 2% are trialing
    status = "trialing";
  }
  
  // Some have billing paused
  if (status === "active" && Math.random() < 0.05) {
    billingPausedAt = randomDateBetween(startedAt, endDate).toISOString();
  }
  
  return {
    subscription_id: generateId(),
    customer_id: customerId,
    created_at: subscriptionCreatedAt.toISOString(),
    started_at: startedAt.toISOString(),
    ended_at: endedAt,
    plan_name: selectedPlan.name,
    monthly_price: Math.round(monthlyPrice * 100) / 100,
    currency,
    status,
    billing_cycle: billingCycle,
    billing_paused_at: billingPausedAt,
    suspended_at: suspendedAt,
    mrr: Math.round(mrr * 100) / 100,
    arr: Math.round(arr * 100) / 100,
  };
}
