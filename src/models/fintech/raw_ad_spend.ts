/**
 * Raw Ad Spend Table
 * 
 * Marketing ad spend data
 * Estimated: ~4,400 records (daily spend per network)
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomDateBetween,
  randomAmount,
  randomIntBetween,
  addDays,
} from "../../lib/random.ts";

export type RawAdSpend = {
  ad_spend_id: string;
  created_at: string;
  network: string;
  channel: string;
  campaign_name: string | null;
  country: string;
  currency: string;
  amount: number;
  conversions: number | null;
};

const csvColumns: Column[] = [
  "ad_spend_id",
  "created_at",
  "network",
  "channel",
  "campaign_name",
  "country",
  "currency",
  "amount",
  "conversions",
];

/**
 * Convert ad spend array to CSV string
 */
export function adSpendToCsv(data: RawAdSpend[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Networks and their channels
 */
const NETWORKS = [
  { network: "google", channels: ["keyword", "brand", "native"], weight: 40 },
  { network: "meta", channels: ["social", "video"], weight: 30 },
  { network: "youtube", channels: ["video", "native"], weight: 20 },
  { network: "other", channels: ["native", "other"], weight: 10 },
];

const COUNTRIES = ["US", "GB", "SE", "DE", "FR", "NL", "ES"];

/**
 * Generate ad spend for date range
 */
export function generateAdSpend(
  startDate: Date,
  endDate: Date
): RawAdSpend[] {
  const adSpend: RawAdSpend[] = [];
  
  // Generate daily spend (not every day has spend)
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    // 60% of days have ad spend
    if (Math.random() < 0.60) {
      // 1-3 campaigns per day
      const campaignCount = randomIntBetween(1, 3);
      
      for (let i = 0; i < campaignCount; i++) {
        // Pick network (weighted)
        const totalWeight = NETWORKS.reduce((sum, n) => sum + n.weight, 0);
        let random = Math.random() * totalWeight;
        let selectedNetwork = NETWORKS[NETWORKS.length - 1];
        for (const network of NETWORKS) {
          random -= network.weight;
          if (random <= 0) {
            selectedNetwork = network;
            break;
          }
        }
        
        const channel = selectedNetwork.channels[
          Math.floor(Math.random() * selectedNetwork.channels.length)
        ];
        const country = COUNTRIES[Math.floor(Math.random() * COUNTRIES.length)];
        
        // Campaign name (50% have names)
        let campaignName: string | null = null;
        if (Math.random() < 0.50) {
          const campaignTypes = [
            "Summer Sale",
            "Product Launch",
            "Brand Awareness",
            "Retargeting",
            "New Customer Acquisition",
            "Holiday Campaign",
          ];
          campaignName = campaignTypes[
            Math.floor(Math.random() * campaignTypes.length)
          ];
        }
        
        // Ad spend amount (varies by network)
        let amount: number;
        if (selectedNetwork.network === "google") {
          amount = randomAmount(500, 5000);
        } else if (selectedNetwork.network === "meta") {
          amount = randomAmount(300, 3000);
        } else if (selectedNetwork.network === "youtube") {
          amount = randomAmount(200, 2000);
        } else {
          amount = randomAmount(100, 1000);
        }
        
        // Conversions: 70% have conversions (1-50 per campaign)
        let conversions: number | null = null;
        if (Math.random() < 0.70) {
          conversions = randomIntBetween(1, 50);
        }
        
        adSpend.push({
          ad_spend_id: generateId(),
          created_at: currentDate.toISOString(),
          network: selectedNetwork.network,
          channel,
          campaign_name: campaignName,
          country,
          currency: "USD",
          amount: Math.round(amount * 100) / 100,
          conversions,
        });
      }
    }
    
    // Move to next day
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return adSpend;
}
