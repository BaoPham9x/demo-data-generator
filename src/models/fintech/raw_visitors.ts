/**
 * Raw Visitors Table (Aggregated Daily)
 * 
 * Daily aggregated website visitor metrics for conversion analysis
 * Like Google Analytics daily summaries - one row per day/network/channel/country
 * Estimated: ~5,000-10,000 rows (daily aggregates over 3 years)
 */

import { stringify, type Column } from "jsr:@std/csv";
import { generateId } from "../../lib/id.ts";
import {
  randomIntBetween,
  addDays,
} from "../../lib/random.ts";
import type { RawAdSpend } from "./raw_ad_spend.ts";

export type RawVisitor = {
  visitor_date: string; // YYYY-MM-DD date
  network: string; // google, meta, youtube, other, organic
  channel: string; // keyword, brand, native, social, video, etc.
  country: string; // US, GB, SE, DE, FR, NL, ES
  campaign_name: string | null; // Optional campaign name
  
  // Aggregated metrics
  total_sessions: number; // Total number of sessions
  total_visitors: number; // Unique visitors (distinct visitor_ids)
  total_conversions: number; // Number of visitors who converted
  total_page_views: number; // Total page views across all sessions
  avg_time_on_site_seconds: number; // Average time on site per session
};

const csvColumns: Column[] = [
  "visitor_date",
  "network",
  "channel",
  "country",
  "campaign_name",
  "total_sessions",
  "total_visitors",
  "total_conversions",
  "total_page_views",
  "avg_time_on_site_seconds",
];

/**
 * Convert visitors array to CSV string
 */
export function visitorsToCsv(data: RawVisitor[]): string {
  return stringify(data, {
    columns: csvColumns,
    headers: true,
  }).replaceAll(/Z"""|"""/g, '"');
}

/**
 * Networks and their channels (matching ad_spend)
 */
const NETWORKS = [
  { network: "google", channels: ["keyword", "brand", "native"], weight: 40 },
  { network: "meta", channels: ["social", "video"], weight: 30 },
  { network: "youtube", channels: ["video", "native"], weight: 20 },
  { network: "other", channels: ["native", "other"], weight: 5 },
  { network: "organic", channels: ["direct", "search"], weight: 5 },
];

const COUNTRIES = ["US", "GB", "SE", "DE", "FR", "NL", "ES"];

/**
 * Generate aggregated daily visitor metrics aligned with ad_spend
 */
export function generateVisitors(
  adSpend: RawAdSpend[],
  startDate: Date,
  endDate: Date
): RawVisitor[] {
  const visitors: RawVisitor[] = [];
  
  // Group ad_spend by date, network, channel, country, AND campaign_name
  // This allows per-campaign ROI analysis
  const adSpendByKey = new Map<string, RawAdSpend[]>();
  
  for (const spend of adSpend) {
    const dateKey = spend.created_at.split('T')[0]; // YYYY-MM-DD
    // Include campaign_name in key to separate campaigns
    const campaignKey = spend.campaign_name || '';
    const key = `${dateKey}|${spend.network}|${spend.channel}|${spend.country}|${campaignKey}`;
    
    if (!adSpendByKey.has(key)) {
      adSpendByKey.set(key, []);
    }
    adSpendByKey.get(key)!.push(spend);
  }
  
  // Generate aggregated visitors for each ad_spend campaign
  for (const [key, spends] of adSpendByKey.entries()) {
    const [dateStr, network, channel, country, campaignKey] = key.split('|');
    
    // Aggregate all campaigns for this day/network/channel/country/campaign
    const totalAdSpend = spends.reduce((sum, s) => sum + s.amount, 0);
    const totalConversions = spends.reduce((sum, s) => sum + (s.conversions || 0), 0);
    const campaignName = campaignKey || null; // Use campaign from key
    
    // Estimate visitors based on ad spend
    // Rough estimate: $1 = 2-10 visitors (varies by network)
    let visitorsPerDollar: number;
    if (network === "google") {
      visitorsPerDollar = 3 + Math.random() * 4; // 3-7 visitors per dollar
    } else if (network === "meta") {
      visitorsPerDollar = 4 + Math.random() * 6; // 4-10 visitors per dollar
    } else if (network === "youtube") {
      visitorsPerDollar = 2 + Math.random() * 3; // 2-5 visitors per dollar
    } else {
      visitorsPerDollar = 2 + Math.random() * 3; // 2-5 visitors per dollar
    }
    
    const estimatedTotalVisitors = Math.floor(totalAdSpend * visitorsPerDollar);
    
    // Calculate conversions to maintain 5-10% conversion rate for paid traffic
    // Always calculate from visitors to ensure consistent conversion rate
    const conversionRate = 0.05 + Math.random() * 0.05; // 5-10%
    const conversions = Math.max(1, Math.floor(estimatedTotalVisitors * conversionRate));
    
    // Sessions: visitors typically have 1-3 sessions (some return)
    const sessionsPerVisitor = 1.2 + Math.random() * 0.8; // 1.2-2.0 average
    const totalSessions = Math.floor(estimatedTotalVisitors * sessionsPerVisitor);
    
    // Page views: 2-8 pages per session on average
    const avgPageViewsPerSession = 2 + Math.random() * 6;
    const totalPageViews = Math.floor(totalSessions * avgPageViewsPerSession);
    
    // Time on site: 30-300 seconds per session
    const avgTimeOnSite = 30 + Math.random() * 270;
    
    visitors.push({
      visitor_date: dateStr,
      network,
      channel,
      country,
      campaign_name: campaignName,
      total_sessions: totalSessions,
      total_visitors: estimatedTotalVisitors,
      total_conversions: conversions,
      total_page_views: totalPageViews,
      avg_time_on_site_seconds: Math.round(avgTimeOnSite),
    });
  }
  
  // Also generate organic visitors (not tied to ad spend)
  // Generate daily organic traffic for each country
  const currentDate = new Date(startDate);
  
  while (currentDate <= endDate) {
    const dateStr = currentDate.toISOString().split('T')[0];
    
    for (const country of COUNTRIES) {
      // Organic traffic: 50-500 visitors per day per country
      const organicVisitors = randomIntBetween(50, 500);
      
      // Organic conversion rate: 2-5% (lower than paid)
      const organicConversionRate = 0.02 + Math.random() * 0.03;
      const organicConversions = Math.floor(organicVisitors * organicConversionRate);
      
      // Organic sessions and metrics
      const organicSessionsPerVisitor = 1.1 + Math.random() * 0.6; // 1.1-1.7 average
      const organicSessions = Math.floor(organicVisitors * organicSessionsPerVisitor);
      const organicPageViews = Math.floor(organicSessions * (2 + Math.random() * 5));
      const organicAvgTime = 20 + Math.random() * 200; // Lower than paid
      
      // Pick random organic channel
      const organicNetwork = NETWORKS.find(n => n.network === "organic")!;
      const channel = organicNetwork.channels[
        Math.floor(Math.random() * organicNetwork.channels.length)
      ];
      
      visitors.push({
        visitor_date: dateStr,
        network: "organic",
        channel,
        country,
        campaign_name: null,
        total_sessions: organicSessions,
        total_visitors: organicVisitors,
        total_conversions: organicConversions,
        total_page_views: organicPageViews,
        avg_time_on_site_seconds: Math.round(organicAvgTime),
      });
    }
    
    currentDate.setDate(currentDate.getDate() + 1);
  }
  
  return visitors;
}
