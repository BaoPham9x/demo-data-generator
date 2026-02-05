// Main alert checking script
// Queries Steep metrics and checks against thresholds

import { SteepClient } from "./steep-client.ts";
import type { AlertConfig, AlertResult } from "./types.ts";
import { parse as parseYaml } from "jsr:@std/yaml@^1.0.0";

// Load environment variables from .env file
async function loadEnv(): Promise<Record<string, string>> {
  try {
    const envText = await Deno.readTextFile(".env");
    const env: Record<string, string> = {};
    
    for (const line of envText.split("\n")) {
      const trimmed = line.trim();
      if (trimmed && !trimmed.startsWith("#")) {
        const [key, ...valueParts] = trimmed.split("=");
        if (key && valueParts.length > 0) {
          env[key.trim()] = valueParts.join("=").trim();
        }
      }
    }
    
    return env;
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.warn("⚠️  .env file not found. Using environment variables only.");
      return {};
    }
    throw error;
  }
}

// Compare metric value against threshold
function checkThreshold(
  value: number,
  threshold: number,
  operator: AlertConfig["operator"]
): boolean {
  switch (operator) {
    case ">":
      return value > threshold;
    case "<":
      return value < threshold;
    case ">=":
      return value >= threshold;
    case "<=":
      return value <= threshold;
    case "==":
      return Math.abs(value - threshold) < 0.0001; // Float comparison
    default:
      throw new Error(`Unknown operator: ${operator}`);
  }
}

// Format number with commas
function formatNumber(num: number): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: 0,
    maximumFractionDigits: 2
  }).format(num);
}

// Format alert result for display
function formatAlertResult(result: AlertResult, index: number): string {
  const { alert, metric_value, threshold, triggered, error, query_date } =
    result;

  if (error) {
    return `
┌─ Alert #${index + 1} ─────────────────────────────────────────┐
│ 🔴 ${alert.name}
├───────────────────────────────────────────────────────────────┤
│ ❌ ERROR: ${error}
│ 📊 Metric: ${alert.metric_identifier}
│ 📅 Date: ${query_date}
└───────────────────────────────────────────────────────────────┘
`;
  }

  if (metric_value === null) {
    return `
┌─ Alert #${index + 1} ─────────────────────────────────────────┐
│ ⚠️  ${alert.name}
├───────────────────────────────────────────────────────────────┤
│ ⚠️  No data returned for metric
│ 📊 Metric: ${alert.metric_identifier}
│ 📅 Date: ${query_date}
└───────────────────────────────────────────────────────────────┘
`;
  }

  const status = triggered ? "🔴 TRIGGERED" : "✅ ALL GOOD";
  const comparison = `${formatNumber(metric_value)} ${alert.operator} ${formatNumber(threshold)}`;
  const percentage = threshold > 0 
    ? `${((metric_value / threshold) * 100).toFixed(1)}% of threshold`
    : "N/A";
  
  const statusBar = triggered 
    ? "█".repeat(Math.min(50, Math.floor((metric_value / threshold) * 50)))
    : "█".repeat(Math.min(50, Math.floor((metric_value / threshold) * 50)));

  return `
┌─ Alert #${index + 1} ─────────────────────────────────────────┐
│ ${status} ${alert.name}
├───────────────────────────────────────────────────────────────┤
│ 📊 Metric: ${alert.metric_identifier}
│ 💰 Value: ${formatNumber(metric_value)}
│ 🎯 Threshold: ${formatNumber(threshold)} (${alert.operator})
│ 📈 Status: ${percentage}
│ 
│ ${statusBar}
│ 
│ 📧 Will notify: ${alert.alert_to_emails.join(", ")}
│ 📅 Date: ${query_date}
└───────────────────────────────────────────────────────────────┘
`;
}

// Check a single alert (exported for use in server)
export async function checkAlert(
  client: SteepClient,
  alert: AlertConfig,
  queryDate: string
): Promise<AlertResult> {
  try {
    // Find metric by identifier
    const metric = await client.findMetricByIdentifier(alert.metric_identifier);

    if (!metric) {
      return {
        alert,
        metric_value: null,
        threshold: alert.threshold,
        triggered: false,
        error: `Metric with identifier "${alert.metric_identifier}" not found`,
        query_date: queryDate,
      };
    }

    // Get date range based on time period (default: daily)
    const timePeriod = alert.time_period || "daily";
    const { fromDate, toDate } = SteepClient.getDateRangeForPeriod(timePeriod);

    // Determine time grain based on period
    let timeGrain: "daily" | "weekly" | "monthly";
    if (timePeriod === "weekly") {
      timeGrain = "daily"; // Use daily grain for weekly period
    } else if (timePeriod === "monthly") {
      timeGrain = "daily"; // Use daily grain for monthly period
    } else {
      timeGrain = "daily";
    }

    // Query the metric
    const queryRequest = {
      timeGrain,
      fromDate,
      toDate,
      ...(alert.filters && { filters: alert.filters }),
    };

    const response = await client.queryMetric(metric.id, queryRequest);

    // Aggregate data points (sum them for the day)
    const totalValue = response.data.reduce(
      (sum, point) => sum + (point.metric || 0),
      0
    );

    // Check threshold
    const triggered = checkThreshold(
      totalValue,
      alert.threshold,
      alert.operator
    );

    return {
      alert,
      metric_value: totalValue,
      threshold: alert.threshold,
      triggered,
      query_date: queryDate,
    };
  } catch (error) {
    return {
      alert,
      metric_value: null,
      threshold: alert.threshold,
      triggered: false,
      error: error instanceof Error ? error.message : String(error),
      query_date: queryDate,
    };
  }
}

// Generate fun ASCII art header
function generateHeader(): string {
  return `
╔═══════════════════════════════════════════════════════════════╗
║                                                               ║
║          📊  STEEP METRIC ALERTS  📊                          ║
║                                                               ║
║          Monitoring your metrics, one alert at a time        ║
║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
}

// Generate fun summary box
function generateSummary(results: AlertResult[]): string {
  const triggered = results.filter((r) => r.triggered);
  const errors = results.filter((r) => r.error);
  const ok = results.length - triggered.length - errors.length;
  
  const total = results.length;
  const okPercent = total > 0 ? ((ok / total) * 100).toFixed(0) : "0";
  const triggeredPercent = total > 0 ? ((triggered.length / total) * 100).toFixed(0) : "0";
  
  let emoji = "🎉";
  if (triggered.length > 0) emoji = "🚨";
  else if (errors.length > 0) emoji = "⚠️";
  
  return `
╔═══════════════════════════════════════════════════════════════╗
║                    ${emoji}  FINAL REPORT  ${emoji}                      ║
╠═══════════════════════════════════════════════════════════════╣
║                                                               ║
║  📊 Total Alerts Checked: ${total.toString().padEnd(40)} ║
║                                                               ║
║  ✅ All Good:        ${ok.toString().padEnd(3)} (${okPercent.padStart(3)}%)${" ".repeat(28)} ║
║  🔴 Triggered:      ${triggered.length.toString().padEnd(3)} (${triggeredPercent.padStart(3)}%)${" ".repeat(28)} ║
${errors.length > 0 ? `║  ❌ Errors:         ${errors.length.toString().padEnd(3)}${" ".repeat(35)} ║\n` : ""}║                                                               ║
╚═══════════════════════════════════════════════════════════════╝
`;
}

// Generate fun text report
function generateTextReport(results: AlertResult[], queryDate: string): string {
  let report = `\n╔═══════════════════════════════════════════════════════════════╗\n`;
  report += `║              📋 DETAILED ALERT REPORT                    ║\n`;
  report += `║              Date: ${queryDate.padEnd(40)} ║\n`;
  report += `╚═══════════════════════════════════════════════════════════════╝\n\n`;
  
  results.forEach((result, index) => {
    const { alert, metric_value, threshold, triggered, error } = result;
    
    report += `┌─ Alert #${index + 1}: ${alert.name.padEnd(50)} ┐\n`;
    report += `│                                                               │\n`;
    
    if (error) {
      report += `│ ❌ STATUS: ERROR                                              │\n`;
      report += `│ 📊 Metric: ${alert.metric_identifier.padEnd(52)} │\n`;
      report += `│ ⚠️  ${error.substring(0, 57).padEnd(58)} │\n`;
    } else if (metric_value === null) {
      report += `│ ⚠️  STATUS: NO DATA                                           │\n`;
      report += `│ 📊 Metric: ${alert.metric_identifier.padEnd(52)} │\n`;
    } else {
      const status = triggered ? "🔴 TRIGGERED" : "✅ ALL GOOD";
      const percentage = threshold > 0 
        ? `${((metric_value / threshold) * 100).toFixed(1)}%`
        : "N/A";
      
      report += `│ ${status.padEnd(62)} │\n`;
      report += `│                                                               │\n`;
      report += `│ 📊 Metric Identifier: ${alert.metric_identifier.padEnd(38)} │\n`;
      report += `│ 💰 Current Value: ${formatNumber(metric_value).padEnd(42)} │\n`;
      report += `│ 🎯 Threshold: ${formatNumber(threshold).padEnd(45)} │\n`;
      report += `│ 📈 Percentage: ${percentage.padEnd(46)} │\n`;
      report += `│                                                               │\n`;
      
      // Visual bar
      const barLength = 50;
      const filled = Math.min(barLength, Math.floor((metric_value / Math.max(threshold, metric_value)) * barLength));
      const bar = "█".repeat(filled) + "░".repeat(barLength - filled);
      report += `│ [${bar}] │\n`;
      report += `│                                                               │\n`;
      
      if (triggered) {
        const diff = metric_value - threshold;
        report += `│ ⚠️  Exceeded by: ${formatNumber(Math.abs(diff)).padEnd(45)} │\n`;
      }
      
      report += `│ 📧 Notify: ${alert.alert_to_emails.join(", ").substring(0, 52).padEnd(52)} │\n`;
    }
    
    report += `└───────────────────────────────────────────────────────────────┘\n\n`;
  });
  
  return report;
}

// Main function
async function main() {
  console.log(generateHeader());

  // Load environment variables
  const env = await loadEnv();
  const apiKey = Deno.env.get("STEEP_API_KEY") || env.STEEP_API_KEY;
  const apiBaseUrl =
    Deno.env.get("STEEP_API_BASE_URL") ||
    env.STEEP_API_BASE_URL ||
    "https://api.steep.app";

  if (!apiKey) {
    console.error("❌ Error: STEEP_API_KEY not found in environment or .env file");
    Deno.exit(1);
  }

  // Load alerts config
  let configText: string;
  try {
    configText = await Deno.readTextFile("alerts-prototype/config/alerts.yaml");
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      console.error("❌ Error: alerts-prototype/config/alerts.yaml not found");
      console.error("   Make sure you're running from the project root directory");
      Deno.exit(1);
    }
    throw error;
  }

  const config = parseYaml(configText) as {
    steep: { api_base_url: string };
    alerts: AlertConfig[];
  };

  // Override API base URL from env if provided
  const finalBaseUrl = apiBaseUrl || config.steep.api_base_url;

  // Initialize Steep client
  const client = new SteepClient(apiKey, finalBaseUrl);

  // Get query date based on first alert's time period (for display)
  const firstAlertPeriod = config.alerts[0]?.time_period || "daily";
  const { fromDate } = SteepClient.getDateRangeForPeriod(firstAlertPeriod);
  const queryDate = new Date(fromDate).toISOString().split("T")[0];

  console.log(`\n📅 Checking metrics for: ${queryDate} (yesterday)`);
  console.log(`🔗 Steep API: ${finalBaseUrl}\n`);
  console.log(`🔍 Processing ${config.alerts.length} alert(s)...\n`);

  // Check all alerts
  const results: AlertResult[] = [];
  for (let i = 0; i < config.alerts.length; i++) {
    const alert = config.alerts[i];
    const statusText = `   [${i + 1}/${config.alerts.length}] Checking: ${alert.name}... `;
    Deno.stdout.writeSync(new TextEncoder().encode(statusText));
    const result = await checkAlert(client, alert, queryDate);
    results.push(result);
    if (result.error) {
      console.log("❌");
    } else if (result.triggered) {
      console.log("🔴");
    } else {
      console.log("✅");
    }
  }

  // Display detailed results
  console.log("\n");
  results.forEach((result, index) => {
    console.log(formatAlertResult(result, index));
  });

  // Summary
  console.log(generateSummary(results));

  // Save results to text file
  const outputFile = `raw table output/alert-results-${queryDate}.txt`;
  try {
    await Deno.mkdir("raw table output", { recursive: true });
    let textReport = generateHeader();
    textReport += `\n📅 Date: ${queryDate}\n`;
    textReport += `🔗 Steep API: ${finalBaseUrl}\n\n`;
    textReport += generateTextReport(results, queryDate);
    textReport += generateSummary(results);
    
    await Deno.writeTextFile(outputFile, textReport);
    console.log(`💾 Full report saved to: ${outputFile}\n`);
  } catch (error) {
    console.warn(`⚠️  Could not save report to file: ${error}\n`);
  }

  // Exit with error code if any alerts triggered
  if (results.some((r) => r.triggered)) {
    console.log("🚨 Some alerts were triggered! Check the report above.\n");
    Deno.exit(1);
  }

  if (results.some((r) => r.error)) {
    console.log("⚠️  Some alerts had errors. Check the report above.\n");
    Deno.exit(1);
  }

  console.log("🎉 All alerts passed! Everything looks good!\n");
}

// Run if executed directly
if (import.meta.main) {
  main().catch((error) => {
    console.error("❌ Fatal error:", error);
    Deno.exit(1);
  });
}
