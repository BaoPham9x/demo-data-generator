/**
 * Raw Transactions Table
 * 
 * All financial transactions (TPV - Total Payment Volume)
 * Estimated: ~2,000,000 transactions (over 3 years)
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import { getH3Indexes } from "../../lib/h3.ts";
import {
  randomTransactionType,
  randomMerchantCategory,
  randomPaymentMethod,
  randomMerchantName,
  randomInternalTransactionName,
  randomAmount,
  randomDateBetween,
  randomIntBetween,
  randomPick,
  randomCoordinates,
} from "../../lib/random.ts";

export type RawTransaction = {
  transaction_id: string;
  customer_id: string; // FK → raw_customers.customer_id
  account_id: string; // FK → raw_accounts.account_id
  created_at: string;
  transaction_type: string;
  status: string;
  amount: number;
  currency: string;
  fee_amount: number;
  merchant_name: string | null;
  merchant_category: string;
  payment_method: string;
  balance_before: number;
  balance_after: number;
  risk_flag: string;
  country: string;
  city: string | null;
  latitude: number | null;
  longitude: number | null;
  h3_res_1: string | null;
  h3_res_2: string | null;
  h3_res_3: string | null;
  h3_res_4: string | null;
  h3_res_5: string | null;
  h3_res_6: string | null;
  h3_res_7: string | null;
  h3_res_8: string | null;
  h3_res_9: string | null;
  h3_res_10: string | null;
};

const csvColumns: Column[] = [
  "transaction_id",
  "customer_id",
  "account_id",
  "created_at",
  "transaction_type",
  "status",
  "amount",
  "currency",
  "fee_amount",
  "merchant_name",
  "merchant_category",
  "payment_method",
  "balance_before",
  "balance_after",
  "risk_flag",
  "country",
  "city",
  "latitude",
  "longitude",
  "h3_res_1",
  "h3_res_2",
  "h3_res_3",
  "h3_res_4",
  "h3_res_5",
  "h3_res_6",
  "h3_res_7",
  "h3_res_8",
  "h3_res_9",
  "h3_res_10",
];

/**
 * Convert transactions array to CSV string
 */
export function transactionsToCsv(data: RawTransaction[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Generate transactions for a customer
 */
export function generateTransactions(
  customerId: string,
  accountIds: string[],
  customerCreatedAt: Date,
  activatedAt: Date | null,
  endDate: Date,
  currency: string,
  country: string,
  customerTier: string
): RawTransaction[] {
  const transactions: RawTransaction[] = [];
  
  // If customer never activated, they have very few or no transactions
  if (!activatedAt) {
    // 20% of non-activated customers still have 0-5 transactions
    if (Math.random() < 0.20) {
      const count = randomIntBetween(0, 5);
      for (let i = 0; i < count; i++) {
        const transaction = generateSingleTransaction(
          customerId,
          accountIds[0],
          randomDateBetween(customerCreatedAt, endDate),
          currency,
          country,
          customerTier,
          0 // Start with 0 balance
        );
        if (transaction) transactions.push(transaction);
      }
    }
    return transactions;
  }
  
  // Determine transaction frequency based on customer tier
  let transactionsPerYear: number;
  if (customerTier === "enterprise") {
    transactionsPerYear = randomIntBetween(100, 200); // High frequency
  } else if (customerTier === "premium") {
    transactionsPerYear = randomIntBetween(50, 120);
  } else if (customerTier === "starter") {
    transactionsPerYear = randomIntBetween(10, 50); // Medium frequency
  } else {
    transactionsPerYear = randomIntBetween(1, 10); // Low frequency (free tier)
  }
  
  // Calculate number of transactions over the period
  const yearsActive = (endDate.getTime() - activatedAt.getTime()) / (365.25 * 24 * 60 * 60 * 1000);
  const totalTransactions = Math.floor(transactionsPerYear * yearsActive);
  
  // Generate transactions distributed over time
  let currentBalance = 0; // Track balance per account
  const accountBalances = new Map<string, number>();
  accountIds.forEach(accountId => accountBalances.set(accountId, 0));
  
  for (let i = 0; i < totalTransactions; i++) {
    // Distribute transactions over time (more recent = more transactions)
    const progress = Math.pow(Math.random(), 0.7); // Bias towards recent
    const transactionDate = new Date(
      activatedAt.getTime() + progress * (endDate.getTime() - activatedAt.getTime())
    );
    
    // Pick random account
    const accountId = accountIds[Math.floor(Math.random() * accountIds.length)];
    currentBalance = accountBalances.get(accountId) || 0;
    
    const transaction = generateSingleTransaction(
      customerId,
      accountId,
      transactionDate,
      currency,
      country,
      customerTier,
      currentBalance
    );
    
    if (transaction) {
      transactions.push(transaction);
      accountBalances.set(accountId, transaction.balance_after);
    }
  }
  
  // Sort by date
  transactions.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  return transactions;
}

/**
 * Generate a single transaction
 */
function generateSingleTransaction(
  customerId: string,
  accountId: string,
  transactionDate: Date,
  currency: string,
  country: string,
  customerTier: string,
  currentBalance: number
): RawTransaction | null {
  const transactionType = randomTransactionType();
  const paymentMethod = randomPaymentMethod();
  
  // Transaction amount based on type and tier
  let amount: number;
  if (transactionType === "deposit") {
    amount = randomAmount(100, 10000);
  } else if (transactionType === "refund") {
    amount = randomAmount(10, 500);
  } else if (transactionType === "withdrawal") {
    amount = randomAmount(50, 5000);
  } else if (customerTier === "enterprise") {
    amount = randomAmount(100, 50000);
  } else if (customerTier === "premium") {
    amount = randomAmount(50, 10000);
  } else {
    amount = randomAmount(10, 1000);
  }
  
  // Fee calculation (1-3% for most, higher for some types)
  let feeAmount = 0;
  if (transactionType === "card_spend" || transactionType === "payment") {
    feeAmount = amount * randomAmount(0.01, 0.03);
  } else if (transactionType === "transfer") {
    feeAmount = amount * randomAmount(0.005, 0.02);
  }
  
  // Status distribution: 85% completed, 10% pending, 3% failed, 2% reversed/cancelled
  let status: string;
  const statusRand = Math.random();
  if (statusRand < 0.85) {
    status = "completed";
  } else if (statusRand < 0.95) {
    status = "pending";
  } else if (statusRand < 0.98) {
    status = "failed";
  } else {
    status = randomPick(["reversed", "cancelled"]);
  }
  
  // Merchant info - all transaction types now have names
  let merchantName: string | null = null;
  let merchantCategory: string = "other";
  
  if (transactionType === "card_spend" || transactionType === "payment") {
    merchantCategory = randomMerchantCategory();
    merchantName = randomMerchantName(merchantCategory);
  } else {
    // Internal transactions (transfer, deposit, withdrawal, refund)
    merchantCategory = "internal";
    merchantName = randomInternalTransactionName(transactionType);
  }
  
  // Balance calculation
  let balanceBefore = currentBalance;
  let balanceAfter = currentBalance;
  
  if (status === "completed") {
    if (transactionType === "deposit" || transactionType === "refund") {
      balanceAfter = balanceBefore + amount - feeAmount;
    } else {
      balanceAfter = balanceBefore - amount - feeAmount;
    }
    // Ensure balance doesn't go too negative (some credit allowed)
    if (balanceAfter < -10000) {
      balanceAfter = -10000;
    }
  }
  
  // Risk flag: 95% normal, 4% suspicious, 1% high_risk
  let riskFlag: string = "normal";
  const riskRand = Math.random();
  if (riskRand < 0.01) {
    riskFlag = "high_risk";
  } else if (riskRand < 0.05) {
    riskFlag = "suspicious";
  } else if (riskRand < 0.08) {
    riskFlag = "aml_review";
  }
  
  // Geo data: 70% of transactions have location data (card_spend, payment)
  let city: string | null = null;
  let latitude: number | null = null;
  let longitude: number | null = null;
  let h3Res1: string | null = null;
  let h3Res2: string | null = null;
  let h3Res3: string | null = null;
  let h3Res4: string | null = null;
  let h3Res5: string | null = null;
  let h3Res6: string | null = null;
  let h3Res7: string | null = null;
  let h3Res8: string | null = null;
  let h3Res9: string | null = null;
  let h3Res10: string | null = null;
  
  if ((transactionType === "card_spend" || transactionType === "payment") && Math.random() < 0.70) {
    const coords = randomCoordinates(country);
    city = null; // Could be populated from merchant location
    latitude = Math.round(coords.latitude * 10000) / 10000; // Round to 4 decimals
    longitude = Math.round(coords.longitude * 10000) / 10000;
    
    // Calculate H3 indexes for all resolutions (1-10)
    const h3Indexes = getH3Indexes(latitude, longitude);
    h3Res1 = h3Indexes.h3_res_1;
    h3Res2 = h3Indexes.h3_res_2;
    h3Res3 = h3Indexes.h3_res_3;
    h3Res4 = h3Indexes.h3_res_4;
    h3Res5 = h3Indexes.h3_res_5;
    h3Res6 = h3Indexes.h3_res_6;
    h3Res7 = h3Indexes.h3_res_7;
    h3Res8 = h3Indexes.h3_res_8;
    h3Res9 = h3Indexes.h3_res_9;
    h3Res10 = h3Indexes.h3_res_10;
  }
  
  return {
    transaction_id: generateId(),
    customer_id: customerId,
    account_id: accountId,
    created_at: transactionDate.toISOString(),
    transaction_type: transactionType,
    status,
    amount: Math.round(amount * 100) / 100,
    currency,
    fee_amount: Math.round(feeAmount * 100) / 100,
    merchant_name: merchantName,
    merchant_category: merchantCategory,
    payment_method: paymentMethod,
    balance_before: Math.round(balanceBefore * 100) / 100,
    balance_after: Math.round(balanceAfter * 100) / 100,
    risk_flag: riskFlag,
    country,
    city,
    latitude,
    longitude,
    h3_res_1: h3Res1,
    h3_res_2: h3Res2,
    h3_res_3: h3Res3,
    h3_res_4: h3Res4,
    h3_res_5: h3Res5,
    h3_res_6: h3Res6,
    h3_res_7: h3Res7,
    h3_res_8: h3Res8,
    h3_res_9: h3Res9,
    h3_res_10: h3Res10,
  };
}
