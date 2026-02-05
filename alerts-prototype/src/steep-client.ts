// Steep API client for querying metrics

import type {
  SteepMetric,
  SteepMetricsResponse,
  MetricQueryRequest,
  MetricQueryResponse,
} from "./types.ts";

export class SteepClient {
  private apiKey: string;
  private baseUrl: string;

  constructor(apiKey: string, baseUrl: string = "https://api.steep.app") {
    this.apiKey = apiKey;
    this.baseUrl = baseUrl.replace(/\/$/, ""); // Remove trailing slash
  }

  private async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseUrl}${endpoint}`;
    const headers = {
      Authorization: `ApiKey ${this.apiKey}`,
      "Content-Type": "application/json",
      ...options.headers,
    };

    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(
        `Steep API error (${response.status}): ${errorText || response.statusText}`
      );
    }

    return await response.json();
  }

  /**
   * List all metrics in the semantic layer
   */
  async listMetrics(expand: boolean = true): Promise<SteepMetric[]> {
    const endpoint = `/v1/metrics${expand ? "?expand=true" : ""}`;
    const response = await this.request<SteepMetricsResponse>(endpoint);
    return response.data;
  }

  /**
   * Find a metric by its identifier
   */
  async findMetricByIdentifier(
    identifier: string
  ): Promise<SteepMetric | null> {
    const metrics = await this.listMetrics();
    return metrics.find((m) => m.identifier === identifier) || null;
  }

  /**
   * Query a metric for a specific time range
   */
  async queryMetric(
    metricId: string,
    request: MetricQueryRequest
  ): Promise<MetricQueryResponse> {
    const endpoint = `/v1/metrics/${metricId}/query`;
    return await this.request<MetricQueryResponse>(endpoint, {
      method: "POST",
      body: JSON.stringify(request),
    });
  }

  /**
   * Get date range for different time periods
   */
  static getDateRangeForPeriod(period: "daily" | "weekly" | "monthly" = "daily"): { fromDate: string; toDate: string } {
    const now = new Date();
    let startDate: Date;
    let endDate: Date;

    switch (period) {
      case "daily": {
        // Yesterday (00:00 to 23:59)
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        startDate = yesterday;
        
        endDate = new Date(yesterday);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "weekly": {
        // Last 7 days (including today)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 7);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      case "monthly": {
        // Last 30 days (including today)
        startDate = new Date(now);
        startDate.setDate(startDate.getDate() - 30);
        startDate.setHours(0, 0, 0, 0);
        
        endDate = new Date(now);
        endDate.setHours(23, 59, 59, 999);
        break;
      }
      default: {
        // Default to daily
        const yesterday = new Date(now);
        yesterday.setDate(yesterday.getDate() - 1);
        yesterday.setHours(0, 0, 0, 0);
        startDate = yesterday;
        
        endDate = new Date(yesterday);
        endDate.setHours(23, 59, 59, 999);
      }
    }

    return {
      fromDate: startDate.toISOString(),
      toDate: endDate.toISOString(),
    };
  }

  /**
   * Get yesterday's date range in ISO 8601 format (for backward compatibility)
   */
  static getYesterdayDateRange(): { fromDate: string; toDate: string } {
    return this.getDateRangeForPeriod("daily");
  }
}
