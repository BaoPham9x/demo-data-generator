/**
 * Raw Accounts Table
 * 
 * Customer accounts - customers can have multiple accounts
 * Estimated: ~7,500 accounts (1.5 per customer on average)
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomAccountType,
  randomCreditScore,
  randomAmount,
  randomIntBetween,
  addDays,
} from "../../lib/random.ts";

export type RawAccount = {
  account_id: string;
  customer_id: string; // FK → raw_customers.customer_id
  created_at: string;
  account_type: string;
  account_status: string;
  currency: string;
  credit_limit: number;
  credit_score: number;
  current_balance: number;
  balance_updated_at: string;
};

const csvColumns: Column[] = [
  "account_id",
  "customer_id",
  "created_at",
  "account_type",
  "account_status",
  "currency",
  "credit_limit",
  "credit_score",
  "current_balance",
  "balance_updated_at",
];

/**
 * Convert accounts array to CSV string
 */
export function accountsToCsv(data: RawAccount[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Generate a single account for a customer
 */
export function generateAccount(
  customerId: string,
  createdAt: Date,
  currency: string,
  accountIndex: number
): RawAccount {
  const accountType = randomAccountType();
  const creditScore = randomCreditScore();
  
  // Account status: Most are active
  let accountStatus: string = "active";
  if (Math.random() < 0.03) {
    accountStatus = Math.random() < 0.5 ? "frozen" : "closed";
  }
  
  // Credit limit based on account type and credit score
  let creditLimit: number;
  if (accountType === "investment") {
    creditLimit = randomAmount(50000, 500000);
  } else if (accountType === "business") {
    creditLimit = randomAmount(25000, 200000);
  } else if (creditScore > 750) {
    creditLimit = randomAmount(10000, 100000);
  } else if (creditScore > 650) {
    creditLimit = randomAmount(5000, 50000);
  } else {
    creditLimit = randomAmount(1000, 20000);
  }
  
  // Initial balance: Most start at 0, some have initial deposits
  let currentBalance: number = 0;
  if (Math.random() < 0.30) {
    // 30% of accounts have initial balance
    currentBalance = randomAmount(100, creditLimit * 0.5);
  }
  
  // Account created slightly after customer (0-7 days)
  const accountCreatedAt = addDays(createdAt, randomIntBetween(0, 7));
  
  return {
    account_id: generateId(),
    customer_id: customerId,
    created_at: accountCreatedAt.toISOString(),
    account_type: accountType,
    account_status: accountStatus,
    currency,
    credit_limit: Math.round(creditLimit * 100) / 100,
    credit_score: creditScore,
    current_balance: Math.round(currentBalance * 100) / 100,
    balance_updated_at: accountCreatedAt.toISOString(),
  };
}
