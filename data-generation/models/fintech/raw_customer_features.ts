/**
 * Raw Customer Features Table
 * 
 * Product feature usage/activation tracking
 * Estimated: ~25,000 feature activations
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomDateBetween,
  addDays,
  randomIntBetween,
} from "../../lib/random.ts";

export type RawCustomerFeature = {
  customer_feature_id: string;
  customer_id: string; // FK → raw_customers.customer_id
  feature_name: string;
  activated_at: string;
  last_used_at: string | null;
  feature_category: string;
  is_active: boolean;
};

const csvColumns: Column[] = [
  "customer_feature_id",
  "customer_id",
  "feature_name",
  "activated_at",
  "last_used_at",
  "feature_category",
  "is_active",
];

/**
 * Convert customer features array to CSV string
 */
export function customerFeaturesToCsv(data: RawCustomerFeature[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Feature definitions
 */
const FEATURES = [
  { name: "cards", category: "cards" },
  { name: "card_tokenization", category: "cards" },
  { name: "invoice_payments", category: "invoicing" },
  { name: "invoice_approval_flows", category: "invoicing" },
  { name: "receipt_matching", category: "receipts" },
  { name: "receipt_ai_categorization", category: "receipts" },
  { name: "transaction_coding", category: "pre_accounting" },
  { name: "data_export", category: "pre_accounting" },
  { name: "accounting_integration", category: "integrations" },
  { name: "email_forwarding", category: "payments" },
  { name: "send_money", category: "payments" },
  { name: "export", category: "accounting" },
  { name: "advanced_reporting", category: "accounting" },
];

/**
 * Generate features for a customer
 */
export function generateCustomerFeatures(
  customerId: string,
  customerCreatedAt: Date,
  endDate: Date,
  customerTier: string
): RawCustomerFeature[] {
  const features: RawCustomerFeature[] = [];
  
  // Determine number of features based on customer tier
  let featureCount: number;
  if (customerTier === "enterprise") {
    featureCount = randomIntBetween(8, 12); // High engagement
  } else if (customerTier === "premium") {
    featureCount = randomIntBetween(5, 9);
  } else if (customerTier === "starter") {
    featureCount = randomIntBetween(3, 6); // Medium engagement
  } else {
    featureCount = randomIntBetween(1, 3); // Low engagement (free tier)
  }
  
  // Some customers never activate features (10%)
  if (Math.random() < 0.10) {
    return [];
  }
  
  // Select random features
  const selectedFeatures = new Set<string>();
  while (selectedFeatures.size < featureCount && selectedFeatures.size < FEATURES.length) {
    const feature = FEATURES[Math.floor(Math.random() * FEATURES.length)];
    selectedFeatures.add(feature.name);
  }
  
  // Generate feature activations
  for (const featureName of selectedFeatures) {
    const feature = FEATURES.find(f => f.name === featureName)!;
    
    // Activation happens after customer creation (0-180 days)
    const activatedAt = addDays(
      customerCreatedAt,
      randomIntBetween(0, 180)
    );
    
    // Last used: 70% have been used recently, 30% inactive
    let lastUsedAt: string | null = null;
    let isActive = true;
    
    if (Math.random() < 0.70) {
      // Feature is active and used
      lastUsedAt = randomDateBetween(activatedAt, endDate).toISOString();
      isActive = true;
    } else {
      // Feature was activated but not used recently (inactive)
      lastUsedAt = randomDateBetween(
        activatedAt,
        addDays(activatedAt, 30)
      ).toISOString();
      isActive = false;
    }
    
    features.push({
      customer_feature_id: generateId(),
      customer_id: customerId,
      feature_name: feature.name,
      activated_at: activatedAt.toISOString(),
      last_used_at: lastUsedAt,
      feature_category: feature.category,
      is_active: isActive,
    });
  }
  
  return features;
}
