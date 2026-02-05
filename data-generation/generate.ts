/**
 * Main data generation script
 * 
 * Generates all raw tables as CSV files in the correct order to maintain referential integrity:
 * 1. Customers (foundation)
 * 2. Accounts (references customers)
 * 3. Subscriptions (references customers)
 * 4. Customer Features (references customers)
 * 5. Transactions (references customers and accounts)
 * 6. Risk Events (references customers, transactions, accounts)
 * 7. Ad Spend (independent)
 * 8. Visitors (references ad_spend and customers for conversion tracking)
 * 
 * Output: CSV files in ./raw table output/ directory
 */

import { getOutputPath } from "./lib/csv.ts";
import { generateCustomer } from "./models/fintech/raw_customers.ts";
import { customersToCsv } from "./models/fintech/raw_customers.ts";
import { generateAccount, type RawAccount } from "./models/fintech/raw_accounts.ts";
import { accountsToCsv } from "./models/fintech/raw_accounts.ts";
import { generateSubscription } from "./models/fintech/raw_subscriptions.ts";
import { subscriptionsToCsv } from "./models/fintech/raw_subscriptions.ts";
import { generateCustomerFeatures } from "./models/fintech/raw_customer_features.ts";
import { customerFeaturesToCsv } from "./models/fintech/raw_customer_features.ts";
import { generateTransactions } from "./models/fintech/raw_transactions.ts";
import { transactionsToCsv } from "./models/fintech/raw_transactions.ts";
import { generateAdSpend } from "./models/fintech/raw_ad_spend.ts";
import { adSpendToCsv } from "./models/fintech/raw_ad_spend.ts";
import { generateRiskEvents } from "./models/fintech/raw_risk_events.ts";
import { riskEventsToCsv } from "./models/fintech/raw_risk_events.ts";
import { generateVisitors } from "./models/fintech/raw_visitors.ts";
import { visitorsToCsv } from "./models/fintech/raw_visitors.ts";
import { randomDateBetween, randomAccountCount, randomIntBetween } from "./lib/random.ts";

if (import.meta.main) {
  const startDate = new Date("2024-01-01");
  const endDate = new Date("2026-12-31");
  const customerCount = 5000;
  
  console.log("🚀 Starting demo data generation...");
  console.log(`📅 Date range: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`);
  console.log(`👥 Generating ${customerCount} customers...`);
  console.log("");
  
  try {
    // Step 1: Generate customers
    console.log("📝 Step 1/6: Generating customers...");
    const customers = [];
    for (let i = 0; i < customerCount; i++) {
      const createdAt = randomDateBetween(startDate, endDate);
      customers.push(generateCustomer(createdAt, endDate));
      if ((i + 1) % 500 === 0) {
        console.log(`   Generated ${i + 1}/${customerCount} customers...`);
      }
    }
    console.log(`✅ Generated ${customers.length} customers`);
    
    // Write customers CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_customers"),
      customersToCsv(customers)
    );
    console.log("💾 Saved raw_customers.csv");
    console.log("");
    
    // Step 2: Generate accounts
    console.log("📝 Step 2/6: Generating accounts...");
    const accounts = [];
    for (const customer of customers) {
      const accountCount = randomAccountCount();
      const customerCreatedAt = new Date(customer.created_at);
      
      // Get customer currency from country (simplified - using US for now, can enhance)
      const currency = "USD"; // TODO: Map from country
      
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
    
    // Write accounts CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_accounts"),
      accountsToCsv(accounts)
    );
    console.log("💾 Saved raw_accounts.csv");
    console.log("");
    
    // Step 3: Generate subscriptions
    console.log("📝 Step 3/6: Generating subscriptions...");
    const subscriptions = [];
    for (const customer of customers) {
      const customerCreatedAt = new Date(customer.created_at);
      const currency = "USD"; // TODO: Map from country
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
    
    // Write subscriptions CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_subscriptions"),
      subscriptionsToCsv(subscriptions)
    );
    console.log("💾 Saved raw_subscriptions.csv");
    console.log("");
    
    // Step 4: Generate customer features
    console.log("📝 Step 4/6: Generating customer features...");
    const customerFeatures = [];
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
    
    // Write customer features CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_customer_features"),
      customerFeaturesToCsv(customerFeatures)
    );
    console.log("💾 Saved raw_customer_features.csv");
    console.log("");
    
    // Step 5: Generate transactions
    console.log("📝 Step 5/8: Generating transactions...");
    const transactions = [];
    const accountsByCustomer = new Map<string, RawAccount[]>();
    
    // Group accounts by customer
    for (const account of accounts) {
      if (!accountsByCustomer.has(account.customer_id)) {
        accountsByCustomer.set(account.customer_id, []);
      }
      const customerAccounts = accountsByCustomer.get(account.customer_id)!;
      customerAccounts.push(account);
    }
    
    let processedCustomers = 0;
    for (const customer of customers) {
      const customerAccounts = accountsByCustomer.get(customer.customer_id) || [];
      if (customerAccounts.length === 0) continue;
      
      const accountIds = customerAccounts.map(a => a.account_id);
      const customerCreatedAt = new Date(customer.created_at);
      const activatedAt = customer.activated_at ? new Date(customer.activated_at) : null;
      const currency = "USD"; // TODO: Map from country
      
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
      
      transactions.push(...customerTransactions);
      processedCustomers++;
      
      if (processedCustomers % 500 === 0) {
        console.log(`   Processed ${processedCustomers}/${customers.length} customers (${transactions.length} transactions so far)...`);
      }
    }
    console.log(`✅ Generated ${transactions.length} transactions`);
    
    // Write transactions CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_transactions"),
      transactionsToCsv(transactions)
    );
    console.log("💾 Saved raw_transactions.csv");
    console.log("");
    
    // Step 6: Generate risk events
    console.log("📝 Step 6/8: Generating risk events...");
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
    
    // Write risk events CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_risk_events"),
      riskEventsToCsv(riskEvents)
    );
    console.log("💾 Saved raw_risk_events.csv");
    console.log("");
    
    // Step 7: Generate ad spend
    console.log("📝 Step 7/8: Generating ad spend...");
    const adSpend = generateAdSpend(startDate, endDate);
    console.log(`✅ Generated ${adSpend.length} ad spend records`);
    
    // Write ad spend CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_ad_spend"),
      adSpendToCsv(adSpend)
    );
    console.log("💾 Saved raw_ad_spend.csv");
    console.log("");
    
    // Step 8: Generate visitors (requires ad_spend)
    console.log("📝 Step 8/8: Generating visitors...");
    const visitors = generateVisitors(adSpend, startDate, endDate);
    console.log(`✅ Generated ${visitors.length} visitor sessions`);
    
    // Write visitors CSV
    Deno.writeTextFileSync(
      getOutputPath("raw_visitors"),
      visitorsToCsv(visitors)
    );
    console.log("💾 Saved raw_visitors.csv");
    console.log("");
    
  } catch (error) {
    console.error("❌ Error during generation:", error);
    console.error(error.stack);
    Deno.exit(1);
  }
  
  console.log("✅ Generation complete!");
  console.log("📁 Check ./raw table output/ directory for CSV files");
  console.log("");
    console.log("📊 Summary:");
    console.log("   - raw_customers.csv");
    console.log("   - raw_accounts.csv");
    console.log("   - raw_subscriptions.csv");
    console.log("   - raw_customer_features.csv");
    console.log("   - raw_transactions.csv");
    console.log("   - raw_risk_events.csv");
    console.log("   - raw_ad_spend.csv");
    console.log("   - raw_visitors.csv");
}
