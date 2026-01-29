/**
 * Raw Risk Events Table
 * 
 * Risk/compliance events and alerts
 * Estimated: ~15,000 events (over 3 years)
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomDateBetween,
  addDays,
  randomIntBetween,
  randomPick,
} from "../../lib/random.ts";

export type RawRiskEvent = {
  risk_event_id: string;
  customer_id: string; // FK → raw_customers.customer_id
  transaction_id: string | null; // FK → raw_transactions.transaction_id (nullable)
  account_id: string | null; // FK → raw_accounts.account_id (nullable)
  created_at: string;
  event_type: string;
  severity: string;
  status: string;
  resolved_at: string | null;
  description: string | null;
};

const csvColumns: Column[] = [
  "risk_event_id",
  "customer_id",
  "transaction_id",
  "account_id",
  "created_at",
  "event_type",
  "severity",
  "status",
  "resolved_at",
  "description",
];

/**
 * Convert risk events array to CSV string
 */
export function riskEventsToCsv(data: RawRiskEvent[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Risk event types
 */
const EVENT_TYPES = [
  { type: "fraud_alert", severity: ["high", "critical"], weight: 30 },
  { type: "aml_flag", severity: ["medium", "high"], weight: 25 },
  { type: "suspicious_activity", severity: ["medium", "high"], weight: 20 },
  { type: "velocity_check", severity: ["low", "medium"], weight: 10 },
  { type: "amount_threshold", severity: ["medium", "high"], weight: 8 },
  { type: "geographic_anomaly", severity: ["low", "medium"], weight: 5 },
  { type: "device_change", severity: ["low"], weight: 2 },
];

/**
 * Generate risk events for customers/transactions
 */
export function generateRiskEvents(
  customers: Array<{ customer_id: string; created_at: string; risk_score: number }>,
  transactions: Array<{ transaction_id: string; customer_id: string; account_id: string; created_at: string; risk_flag: string }>,
  accounts: Array<{ account_id: string; customer_id: string }>,
  startDate: Date,
  endDate: Date
): RawRiskEvent[] {
  const riskEvents: RawRiskEvent[] = [];
  
  // Generate events from transactions (70% of events come from transactions)
  const riskyTransactions = transactions.filter(t => 
    t.risk_flag !== 'normal' && Math.random() < 0.15 // 15% of risky transactions generate events
  );
  
  for (const tx of riskyTransactions) {
    // Pick event type based on risk flag
    let eventType: string;
    let severity: string;
    
    if (tx.risk_flag === 'high_risk') {
      eventType = randomPick(['fraud_alert', 'aml_flag']);
      severity = randomPick(['high', 'critical']);
    } else if (tx.risk_flag === 'suspicious') {
      eventType = randomPick(['suspicious_activity', 'aml_flag', 'amount_threshold']);
      severity = randomPick(['medium', 'high']);
    } else {
      eventType = randomPick(['suspicious_activity', 'velocity_check']);
      severity = randomPick(['low', 'medium']);
    }
    
    // Event created shortly after transaction (0-24 hours)
    const eventDate = addDays(new Date(tx.created_at), randomIntBetween(0, 1));
    if (eventDate > endDate) continue;
    
    // Status: 60% resolved, 30% investigating, 10% open
    let status: string;
    let resolvedAt: string | null = null;
    const statusRand = Math.random();
    
    if (statusRand < 0.60) {
      status = randomPick(['resolved', 'false_positive']);
      resolvedAt = addDays(eventDate, randomIntBetween(1, 7)).toISOString();
    } else if (statusRand < 0.90) {
      status = 'investigating';
    } else {
      status = 'open';
    }
    
    riskEvents.push({
      risk_event_id: generateId(),
      customer_id: tx.customer_id,
      transaction_id: tx.transaction_id,
      account_id: tx.account_id,
      created_at: eventDate.toISOString(),
      event_type: eventType,
      severity,
      status,
      resolved_at: resolvedAt,
      description: `${eventType.replace('_', ' ')} detected for transaction`,
    });
  }
  
  // Generate customer-level events (30% of events)
  const customerEventCount = Math.floor(riskEvents.length * 0.43); // 30% of total
  
  for (let i = 0; i < customerEventCount; i++) {
    const customer = customers[Math.floor(Math.random() * customers.length)];
    const customerCreatedAt = new Date(customer.created_at);
    
    // Pick event type (weighted)
    const totalWeight = EVENT_TYPES.reduce((sum, e) => sum + e.weight, 0);
    let random = Math.random() * totalWeight;
    let selectedEvent = EVENT_TYPES[EVENT_TYPES.length - 1];
    for (const event of EVENT_TYPES) {
      random -= event.weight;
      if (random <= 0) {
        selectedEvent = event;
        break;
      }
    }
    
    const severity = randomPick(selectedEvent.severity);
    const eventDate = randomDateBetween(customerCreatedAt, endDate);
    
    // Status
    let status: string;
    let resolvedAt: string | null = null;
    const statusRand = Math.random();
    
    if (statusRand < 0.60) {
      status = randomPick(['resolved', 'false_positive']);
      resolvedAt = addDays(eventDate, randomIntBetween(1, 14)).toISOString();
    } else if (statusRand < 0.90) {
      status = 'investigating';
    } else {
      status = 'open';
    }
    
    // Get customer's account (if any)
    const customerAccounts = accounts.filter(a => a.customer_id === customer.customer_id);
    const accountId = customerAccounts.length > 0 ? customerAccounts[0].account_id : null;
    
    riskEvents.push({
      risk_event_id: generateId(),
      customer_id: customer.customer_id,
      transaction_id: null,
      account_id: accountId,
      created_at: eventDate.toISOString(),
      event_type: selectedEvent.type,
      severity,
      status,
      resolved_at: resolvedAt,
      description: `${selectedEvent.type.replace('_', ' ')} for customer`,
    });
  }
  
  // Sort by date
  riskEvents.sort((a, b) => 
    new Date(a.created_at).getTime() - new Date(b.created_at).getTime()
  );
  
  return riskEvents;
}
