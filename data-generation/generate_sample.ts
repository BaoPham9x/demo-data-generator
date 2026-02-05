/**
 * Generate a small sample of data to show example rows
 * This generates just 10 customers to see what the data looks like
 */

// @deno-types="deno:///types.d.ts"
import { getOutputPath } from "./lib/csv.ts";

// Type declarations for Deno globals
declare const Deno: {
  writeTextFileSync(path: string, data: string): void;
  exit(code: number): never;
};

// Extend ImportMeta for Deno
declare global {
  interface ImportMeta {
    main: boolean;
  }
}
import { generateCustomer } from "./models/fintech/raw_customers.ts";
import { customersToCsv } from "./models/fintech/raw_customers.ts";
import { generateAccount } from "./models/fintech/raw_accounts.ts";
import { accountsToCsv } from "./models/fintech/raw_accounts.ts";
import { generateSubscription } from "./models/fintech/raw_subscriptions.ts";
import { subscriptionsToCsv } from "./models/fintech/raw_subscriptions.ts";
import { generateCustomerFeatures } from "./models/fintech/raw_customer_features.ts";
import { customerFeaturesToCsv } from "./models/fintech/raw_customer_features.ts";
import { generateTransactions } from "./models/fintech/raw_transactions.ts";
import { transactionsToCsv } from "./models/fintech/raw_transactions.ts";
import { generateAdSpend } from "./models/fintech/raw_ad_spend.ts";
import { adSpendToCsv } from "./models/fintech/raw_ad_spend.ts";
import { generateVisitors } from "./models/fintech/raw_visitors.ts";
import { visitorsToCsv } from "./models/fintech/raw_visitors.ts";
import { generateRiskEvents } from "./models/fintech/raw_risk_events.ts";
import { riskEventsToCsv } from "./models/fintech/raw_risk_events.ts";
import { randomDateBetween, randomAccountCount } from "./lib/random.ts";
import type { RawAccount } from "./models/fintech/raw_accounts.ts";
import type { RawCustomer } from "./models/fintech/raw_customers.ts";
import type { RawSubscription } from "./models/fintech/raw_subscriptions.ts";
import type { RawCustomerFeature } from "./models/fintech/raw_customer_features.ts";
import type { RawTransaction } from "./models/fintech/raw_transactions.ts";
import type { RawRiskEvent } from "./models/fintech/raw_risk_events.ts";

if (import.meta.main) {
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2024-03-31"); // Just 3 months for sample
  const customerCount = 10; // Small sample
  
  console.log("🎯 Generating SAMPLE data (10 customers, 3 months)...");
  console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log("");
  
  try {
    // Step 1: Generate customers
    console.log("📝 Generating 10 customers...");
    const customers: RawCustomer[] = [];
    for (let i = 0; i < customerCount; i++) {
      const createdAt = randomDateBetween(startDate, endDate);
      customers.push(generateCustomer(createdAt, endDate));
    }
    console.log(`✅ Generated ${customers.length} customers`);
    
    // Write customers CSV
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_customers"),
      customersToCsv(customers)
    );
    console.log("💾 Saved sample_raw_customers.csv");
    console.log("");
    
    // Step 2: Generate accounts
    console.log("📝 Generating accounts...");
    const accounts: RawAccount[] = [];
    for (const customer of customers) {
      const accountCount = randomAccountCount();
      const customerCreatedAt = new Date(customer.created_at);
      const currency = "USD"; // Simplified for sample
      
      for (let i = 0; i < accountCount; i++) {
        accounts.push(generateAccount(
          customer.customer_id,
          customerCreatedAt,
          currency,
          i
        ));
      }
    }
    console.log(`✅ Generated ${accounts.length} accounts`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_accounts"),
      accountsToCsv(accounts)
    );
    console.log("💾 Saved sample_raw_accounts.csv");
    console.log("");
    
    // Step 3: Generate subscriptions
    console.log("📝 Generating subscriptions...");
    const subscriptions: RawSubscription[] = [];
    for (const customer of customers) {
      const customerCreatedAt = new Date(customer.created_at);
      const currency = "USD";
      const subscription = generateSubscription(
        customer.customer_id,
        customerCreatedAt,
        endDate,
        currency
      );
      if (subscription) {
        subscriptions.push(subscription);
      }
    }
    console.log(`✅ Generated ${subscriptions.length} subscriptions`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_subscriptions"),
      subscriptionsToCsv(subscriptions)
    );
    console.log("💾 Saved sample_raw_subscriptions.csv");
    console.log("");
    
    // Step 4: Generate customer features
    console.log("📝 Generating customer features...");
    const customerFeatures: RawCustomerFeature[] = [];
    for (const customer of customers) {
      const customerCreatedAt = new Date(customer.created_at);
      const features = generateCustomerFeatures(
        customer.customer_id,
        customerCreatedAt,
        endDate,
        customer.customer_tier
      );
      customerFeatures.push(...features);
    }
    console.log(`✅ Generated ${customerFeatures.length} customer features`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_customer_features"),
      customerFeaturesToCsv(customerFeatures)
    );
    console.log("💾 Saved sample_raw_customer_features.csv");
    console.log("");
    
    // Step 5: Generate transactions (limited for sample)
    console.log("📝 Generating transactions (limited for sample)...");
    const transactions: RawTransaction[] = [];
    const accountsByCustomer = new Map<string, RawAccount[]>();
    
    for (const account of accounts) {
      if (!accountsByCustomer.has(account.customer_id)) {
        accountsByCustomer.set(account.customer_id, []);
      }
      const customerAccounts = accountsByCustomer.get(account.customer_id)!;
      customerAccounts.push(account);
    }
    
    for (const customer of customers) {
      const customerAccounts = accountsByCustomer.get(customer.customer_id) || [];
      if (customerAccounts.length === 0) continue;
      
      const accountIds = customerAccounts.map(a => a.account_id);
      const customerCreatedAt = new Date(customer.created_at);
      const activatedAt = customer.activated_at ? new Date(customer.activated_at) : null;
      const currency = "USD";
      
      // Limit transactions for sample (max 20 per customer)
      const customerTransactions = generateTransactions(
        customer.customer_id,
        accountIds,
        customerCreatedAt,
        activatedAt,
        endDate,
        currency,
        customer.country,
        customer.customer_tier
      );
      
      // Limit to first 20 transactions per customer for sample
      transactions.push(...customerTransactions.slice(0, 20));
    }
    console.log(`✅ Generated ${transactions.length} transactions (limited for sample)`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_transactions"),
      transactionsToCsv(transactions)
    );
    console.log("💾 Saved sample_raw_transactions.csv");
    console.log("");
    
    // Step 6: Generate risk events (limited for sample)
    console.log("📝 Generating risk events (limited for sample)...");
    const riskEvents = generateRiskEvents(
      customers.map(c => ({
        customer_id: c.customer_id,
        created_at: c.created_at,
        risk_score: c.risk_score,
      })),
      transactions.map(t => ({
        transaction_id: t.transaction_id,
        customer_id: t.customer_id,
        account_id: t.account_id,
        created_at: t.created_at,
        risk_flag: t.risk_flag,
      })),
      accounts.map(a => ({
        account_id: a.account_id,
        customer_id: a.customer_id,
      })),
      startDate,
      endDate
    );
    console.log(`✅ Generated ${riskEvents.length} risk events`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_risk_events"),
      riskEventsToCsv(riskEvents)
    );
    console.log("💾 Saved sample_raw_risk_events.csv");
    console.log("");
    
    // Step 7: Generate ad spend (just 1 month for sample)
    console.log("📝 Generating ad spend (1 month sample)...");
    const sampleStartDate = new Date("2024-01-01");
    const sampleEndDate = new Date("2024-01-31");
    const adSpend = generateAdSpend(sampleStartDate, sampleEndDate);
    console.log(`✅ Generated ${adSpend.length} ad spend records`);
    
    Deno.writeTextFileSync(
      getOutputPath("sample_raw_ad_spend"),
      adSpendToCsv(adSpend)
    );
    console.log("💾 Saved sample_raw_ad_spend.csv");
    console.log("");
    
    console.log("✅ Sample generation complete!");
    console.log("📁 Check ./raw table output/ directory for sample_*.csv files");
    console.log("");
    console.log("📊 Sample Summary:");
    console.log(`   - ${customers.length} customers`);
    console.log(`   - ${accounts.length} accounts`);
    console.log(`   - ${subscriptions.length} subscriptions`);
    console.log(`   - ${customerFeatures.length} customer features`);
    console.log(`   - ${transactions.length} transactions`);
    console.log(`   - ${riskEvents.length} risk events`);
    console.log(`   - ${adSpend.length} ad spend records`);
    console.log("");
    console.log("💡 Tip: Open these CSV files in Excel/Sheets to see the data structure!");
    
  } catch (error) {
    console.error("❌ Error during generation:", error);
    console.error(error.stack);
    Deno.exit(1);
  }
}
