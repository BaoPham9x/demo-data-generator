/**
 * Raw Customers Table
 * 
 * Customer master data - one row per customer
 * Estimated: ~5,000 customers
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomFirstName,
  randomLastName,
  randomEmail,
  randomCountry,
  randomRegistrationSource,
  randomCustomerTier,
  randomRiskScore,
  randomDateBetween,
  addDays,
  randomIntBetween,
} from "../../lib/random.ts";

export type RawCustomer = {
  customer_id: string;
  created_at: string; // ISO datetime string
  email: string;
  first_name: string;
  last_name: string;
  country: string;
  city: string;
  region: string;
  timezone: string;
  registration_source: string;
  
  // KYB fields
  kyb_started_at: string | null;
  kyb_submitted_at: string | null;
  kyb_approved_at: string | null;
  kyb_status: string;
  
  // Activation
  activated_at: string | null;
  
  // Customer attributes
  customer_tier: string;
  account_status: string;
  risk_score: number;
};

const csvColumns: Column[] = [
  "customer_id",
  "created_at",
  "email",
  "first_name",
  "last_name",
  "country",
  "city",
  "region",
  "timezone",
  "registration_source",
  "kyb_started_at",
  "kyb_submitted_at",
  "kyb_approved_at",
  "kyb_status",
  "activated_at",
  "customer_tier",
  "account_status",
  "risk_score",
];

/**
 * Convert customers array to CSV string
 */
export function customersToCsv(data: RawCustomer[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Generate a single customer with realistic data
 */
export function generateCustomer(createdAt: Date, endDate: Date): RawCustomer {
  const firstName = randomFirstName();
  const lastName = randomLastName();
  const email = randomEmail(firstName, lastName);
  const countryData = randomCountry();
  const registrationSource = randomRegistrationSource();
  const customerTier = randomCustomerTier();
  const riskScore = randomRiskScore();
  
  // KYB flow simulation
  // 80% of customers start KYB, 70% of those submit, 85% of those get approved
  let kybStartedAt: string | null = null;
  let kybSubmittedAt: string | null = null;
  let kybApprovedAt: string | null = null;
  let kybStatus: string = "not_started";
  
  if (Math.random() < 0.80) {
    // Customer started KYB (within 1-7 days of registration)
    kybStartedAt = addDays(createdAt, randomIntBetween(1, 7)).toISOString();
    kybStatus = "in_progress";
    
    if (Math.random() < 0.70) {
      // Customer submitted KYB (within 1-14 days of starting)
      const startedDate = new Date(kybStartedAt);
      kybSubmittedAt = addDays(startedDate, randomIntBetween(1, 14)).toISOString();
      kybStatus = "submitted";
      
      if (Math.random() < 0.85) {
        // KYB approved (within 1-5 days of submission)
        const submittedDate = new Date(kybSubmittedAt);
        kybApprovedAt = addDays(submittedDate, randomIntBetween(1, 5)).toISOString();
        kybStatus = "approved";
      } else {
        kybStatus = "declined";
      }
    }
  }
  
  // Activation: 70% of customers activate (make first transaction)
  // Activation happens after KYB approval (if KYB was done) or after registration
  let activatedAt: string | null = null;
  if (Math.random() < 0.70) {
    const activationBaseDate = kybApprovedAt 
      ? new Date(kybApprovedAt)
      : addDays(createdAt, randomIntBetween(1, 30));
    activatedAt = randomDateBetween(activationBaseDate, endDate).toISOString();
  }
  
  // Account status: Most are active, some frozen/closed
  let accountStatus: string = "active";
  if (Math.random() < 0.05) {
    accountStatus = Math.random() < 0.5 ? "frozen" : "closed";
  } else if (Math.random() < 0.02) {
    accountStatus = "suspended";
  }
  
  return {
    customer_id: generateId(),
    created_at: createdAt.toISOString(),
    email,
    first_name: firstName,
    last_name: lastName,
    country: countryData.code,
    city: countryData.city,
    region: countryData.region,
    timezone: countryData.timezone,
    registration_source: registrationSource,
    kyb_started_at: kybStartedAt,
    kyb_submitted_at: kybSubmittedAt,
    kyb_approved_at: kybApprovedAt,
    kyb_status: kybStatus,
    activated_at: activatedAt,
    customer_tier: customerTier,
    account_status: accountStatus,
    risk_score: riskScore,
  };
}
