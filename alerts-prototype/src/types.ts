// Type definitions for alert system

export interface AlertConfig {
  name: string;
  metric_identifier: string;
  threshold: number;
  operator: ">" | "<" | ">=" | "<=" | "==";
  alert_to_emails: string[];
  time_period?: "daily" | "weekly" | "monthly"; // Default: daily
  filters?: Record<string, string>;
}

export interface AlertsConfig {
  steep: {
    api_base_url: string;
  };
  alerts: AlertConfig[];
}

export interface SteepMetric {
  id: string;
  identifier: string;
  label: string;
  description: string | null;
  calculation: string;
  value?: string;
  link: string;
  owner?: string | null;
  category?: string | null;
  module?: string | null;
}

export interface SteepMetricsResponse {
  total: number;
  limit: number;
  skip: number;
  data: SteepMetric[];
}

export interface MetricQueryRequest {
  timeGrain: "daily" | "weekly" | "monthly" | "yearly";
  fromDate: string; // ISO 8601
  toDate: string; // ISO 8601
  filters?: Record<string, string>;
}

export interface MetricDataPoint {
  time: string;
  metric: number;
}

export interface MetricQueryResponse {
  cacheTtlInSeconds: number;
  refreshedAt: string;
  sql: string;
  total: number;
  data: MetricDataPoint[];
}

export interface AlertResult {
  alert: AlertConfig;
  metric_value: number | null;
  threshold: number;
  triggered: boolean;
  error?: string;
  query_date: string;
}
