// Web server for Steep Alerts GUI
// Provides a simple web interface to run and view alerts

import { SteepClient } from "./steep-client.ts";
import type { AlertConfig, AlertResult } from "./types.ts";
import { checkAlert } from "./check-alerts.ts";
import { parse as parseYaml, stringify as stringifyYaml } from "jsr:@std/yaml@^1.0.0";

// In-memory storage for API key (session-based, not persisted)
let sessionApiKey: string | null = null;
let sessionApiBaseUrl: string = "https://api.steep.app";

// HTML template with form
const HTML_TEMPLATE = `<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>📊 Steep Metric Alerts</title>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, sans-serif;
            background: #faf9f7;
            min-height: 100vh;
            margin: 0;
            padding: 0;
            color: #2d3748;
        }
        
        .top-header {
            background: #ffffff;
            border-bottom: 1px solid #e2e8f0;
            padding: 0 48px;
            height: 64px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            position: sticky;
            top: 0;
            z-index: 100;
            box-shadow: 0 1px 3px rgba(0,0,0,0.05);
        }
        
        .logo-container {
            display: flex;
            align-items: center;
            gap: 12px;
            text-decoration: none;
            color: #191919;
        }
        
        .logo-container img {
            height: 32px;
            width: auto;
        }
        
        
        .header-nav {
            display: flex;
            align-items: center;
            gap: 8px;
        }
        
        .header-nav a {
            color: #4a5568;
            text-decoration: none;
            font-size: 0.9em;
            font-weight: 400;
            transition: all 0.2s;
            padding: 8px 16px;
            border-radius: 8px;
        }
        
        .header-nav a:hover {
            color: #191919;
            background: #f7fafc;
        }
        
        .header-nav a.active {
            color: #191919;
            background: #f0f9ff;
            font-weight: 500;
        }
        
        .tab-content {
            display: none;
        }
        
        .tab-content.active {
            display: block;
        }
        
        .metric-card {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 20px;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        
        .metric-card:hover {
            border-color: #81e6d9;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }
        
        .metric-card-header {
            display: flex;
            justify-content: space-between;
            align-items: start;
            margin-bottom: 16px;
        }
        
        .metric-card-title {
            font-weight: 600;
            color: #2d3748;
            font-size: 1.2em;
            margin-bottom: 8px;
        }
        
        .metric-card-identifier {
            font-size: 0.9em;
            color: #718096;
            font-family: monospace;
            background: #f7fafc;
            padding: 4px 10px;
            border-radius: 6px;
            display: inline-block;
            margin-top: 4px;
        }
        
        .metric-card-meta {
            display: flex;
            gap: 12px;
            margin-top: 12px;
            font-size: 0.85em;
            color: #718096;
        }
        
        .metric-meta-item {
            display: flex;
            align-items: center;
            gap: 4px;
        }
        
        .metric-trend-chart {
            width: 100%;
            height: 80px;
            margin: 16px 0;
            background: #faf9f7;
            border-radius: 8px;
            padding: 8px;
        }
        
        .trend-line {
            stroke: #81e6d9;
            stroke-width: 2;
            fill: none;
            stroke-linecap: round;
            stroke-linejoin: round;
        }
        
        .trend-area {
            fill: url(#trendGradient);
            opacity: 0.3;
        }
        
        .metric-card-description {
            color: #4a5568;
            font-size: 0.95em;
            line-height: 1.6;
            margin-top: 12px;
            padding-top: 12px;
            border-top: 1px solid #e2e8f0;
        }
        
        .metric-card-actions {
            display: flex;
            gap: 8px;
            margin-top: 16px;
        }
        
        .loading-container {
            padding: 40px 20px;
            text-align: center;
            color: #718096;
        }
        
        .loading-animation {
            display: inline-block;
            font-size: 2em;
            margin-bottom: 16px;
            animation: walk 1s ease-in-out infinite;
        }
        
        @keyframes walk {
            0%, 100% { transform: translateX(0) rotate(0deg); }
            25% { transform: translateX(10px) rotate(-5deg); }
            50% { transform: translateX(20px) rotate(0deg); }
            75% { transform: translateX(10px) rotate(5deg); }
        }
        
        .loading-progress {
            font-size: 0.9em;
            margin-top: 12px;
            color: #4a5568;
        }
        
        .loading-timer {
            font-size: 0.85em;
            margin-top: 8px;
            color: #a0aec0;
        }
        
        .trend-loading {
            display: inline-block;
            width: auto;
            min-width: 600px;
            height: auto;
            min-height: 180px;
            text-align: center;
            line-height: normal;
        }
        
        .trend-loading-dots {
            display: inline-block;
            font-size: 1.2em;
            color: #a0aec0;
        }
        
        .trend-loading-dots span {
            animation: dotPulse 1.4s infinite ease-in-out;
            display: inline-block;
        }
        
        .trend-loading-dots span:nth-child(1) {
            animation-delay: -0.32s;
        }
        
        .trend-loading-dots span:nth-child(2) {
            animation-delay: -0.16s;
        }
        
        @keyframes dotPulse {
            0%, 80%, 100% {
                opacity: 0.3;
                transform: scale(0.8);
            }
            40% {
                opacity: 1;
                transform: scale(1);
            }
        }
        
        .mini-trend-chart {
            width: 400px;
            height: 120px;
            display: block;
            vertical-align: middle;
        }
        
        .mini-trend-chart svg {
            width: 100%;
            height: 100%;
            display: block;
        }
        
        .trend-container {
            display: flex;
            align-items: center;
            justify-content: center;
            flex: 1;
            min-width: 450px;
            padding: 0 20px;
        }
        
        .container {
            min-height: 100vh;
        }
        
        .main-content {
            max-width: 1200px;
            margin: 0 auto;
            padding: 48px 48px;
        }
        
        .page-header {
            margin-bottom: 48px;
        }
        
        .page-title {
            font-size: 2.5em;
            font-weight: 300;
            color: #191919;
            margin: 0 0 12px 0;
            letter-spacing: -0.5px;
        }
        
        .page-subtitle {
            color: #718096;
            font-size: 1.1em;
            font-weight: 400;
            margin: 0;
        }
        
        .header {
            background: linear-gradient(135deg, #fef5e7 0%, #fef9e7 100%);
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 32px;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .header h1 {
            color: #2d3748;
            font-size: 1.5em;
            margin: 0 0 8px 0;
            font-weight: 400;
        }
        
        .header p {
            color: #718096;
            font-size: 0.95em;
            margin: 0;
        }
        
        .form-section {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            margin-bottom: 24px;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .form-section h2 {
            color: #2d3748;
            margin: 0 0 24px 0;
            font-size: 1.1em;
            font-weight: 500;
        }
        
        .form-group {
            margin-bottom: 20px;
        }
        
        .form-group label {
            display: block;
            margin-bottom: 8px;
            color: #4a5568;
            font-weight: 500;
            font-size: 0.9em;
        }
        
        .form-group input,
        .form-group select {
            width: 100%;
            padding: 12px 16px;
            border: 1.5px solid #e2e8f0;
            border-radius: 12px;
            font-size: 0.95em;
            transition: all 0.2s;
            background: #ffffff;
            color: #2d3748;
        }
        
        .form-group input:focus,
        .form-group select:focus {
            outline: none;
            border-color: #81e6d9;
            box-shadow: 0 0 0 3px rgba(129, 230, 217, 0.1);
        }
        
        .form-group small {
            display: block;
            margin-top: 6px;
            color: #a0aec0;
            font-size: 0.85em;
        }
        
        .form-row {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
        }
        
        .alert-item {
            background: #f7fafc;
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            position: relative;
        }
        
        .alert-item-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
            padding: 12px;
            background: #f7fafc;
            border-radius: 8px;
            transition: background 0.2s;
        }
        
        .alert-item-header:hover {
            background: #edf2f7;
        }
        
        .alert-item-title {
            font-weight: 600;
            color: #2d3748;
            font-size: 1em;
        }
        
        .alert-item-content {
            display: block;
            padding-top: 15px;
        }
        
        .alert-item-content.collapsed {
            display: none;
        }
        
        .alert-toggle-icon {
            display: inline-block;
            transition: transform 0.2s;
        }
        
        .alert-toggle-icon.collapsed {
            transform: rotate(-90deg);
        }
        
        .btn-remove {
            background: #fff5f5;
            color: #fc8181;
            border: 1.5px solid #fed7d7;
            padding: 8px 16px;
            border-radius: 10px;
            cursor: pointer;
            font-size: 0.85em;
            transition: all 0.2s;
        }
        
        .btn-remove:hover {
            background: #fed7d7;
            border-color: #fc8181;
        }
        
        .btn {
            background: linear-gradient(135deg, #81e6d9 0%, #4fd1c7 100%);
            color: #2d3748;
            border: none;
            padding: 14px 24px;
            font-size: 0.95em;
            border-radius: 12px;
            cursor: pointer;
            transition: all 0.2s;
            font-weight: 500;
            width: 100%;
            box-shadow: 0 2px 4px rgba(129, 230, 217, 0.2);
        }
        
        .btn:hover {
            transform: translateY(-1px);
            box-shadow: 0 4px 8px rgba(129, 230, 217, 0.3);
        }
        
        .btn:active {
            transform: translateY(0);
        }
        
        .btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
            transform: none;
        }
        
        .btn-secondary {
            background: #f7fafc;
            color: #4a5568;
            border: 1.5px solid #e2e8f0;
        }
        
        .btn-secondary:hover {
            background: #edf2f7;
            border-color: #cbd5e0;
        }
        
        .status {
            margin-top: 15px;
            padding: 15px;
            border-radius: 8px;
            display: none;
        }
        
        .status.loading {
            background: #ebf8ff;
            color: #2b6cb0;
            display: block;
            border: 1.5px solid #bee3f8;
        }
        
        .status.error {
            background: #fff5f5;
            color: #c53030;
            display: block;
            border: 1.5px solid #fed7d7;
        }
        
        .status.success {
            background: #f0fff4;
            color: #22543d;
            display: block;
            border: 1.5px solid #c6f6d5;
        }
        
        .results {
            background: #ffffff;
            border-radius: 16px;
            padding: 32px;
            border: none;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
            display: none;
        }
        
        .results.show {
            display: block;
        }
        
        .alert-card {
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            margin-bottom: 16px;
            transition: all 0.2s;
            background: #ffffff;
        }
        
        .alert-card:hover {
            border-color: #cbd5e0;
            box-shadow: 0 4px 12px rgba(0,0,0,0.06);
        }
        
        .alert-card.triggered {
            border-color: #fc8181;
            background: #fff5f5;
        }
        
        .alert-card.ok {
            border-color: #68d391;
            background: #f0fff4;
        }
        
        .alert-card.error {
            border-color: #f6ad55;
            background: #fffaf0;
        }
        
        .alert-header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 15px;
        }
        
        .alert-name {
            font-size: 1.2em;
            font-weight: 500;
            color: #2d3748;
        }
        
        .alert-status {
            padding: 6px 16px;
            border-radius: 20px;
            font-weight: 500;
            font-size: 0.85em;
        }
        
        .alert-status.triggered {
            background: #fc8181;
            color: #ffffff;
        }
        
        .alert-status.ok {
            background: #68d391;
            color: #ffffff;
        }
        
        .alert-status.error {
            background: #f6ad55;
            color: #ffffff;
        }
        
        .performance-indicator {
            font-size: 0.85em;
            font-weight: 500;
            margin-top: 4px;
        }
        
        .performance-indicator.up {
            color: #4caf50;
        }
        
        .performance-indicator.down {
            color: #f44336;
        }
        
        .alert-details {
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
            gap: 15px;
            margin-top: 15px;
        }
        
        .detail-item {
            padding: 12px 16px;
            background: #f7fafc;
            border-radius: 12px;
            border: 1px solid #e2e8f0;
        }
        
        .detail-label {
            font-size: 0.8em;
            color: #718096;
            margin-bottom: 6px;
            font-weight: 500;
        }
        
        .detail-value {
            font-size: 1.1em;
            font-weight: 500;
            color: #2d3748;
        }
        
        .progress-bar {
            width: 100%;
            height: 24px;
            background: #e2e8f0;
            border-radius: 12px;
            overflow: hidden;
            margin-top: 12px;
        }
        
        .progress-fill {
            height: 100%;
            background: linear-gradient(135deg, #81e6d9 0%, #4fd1c7 100%);
            transition: width 0.3s;
            display: flex;
            align-items: center;
            justify-content: center;
            color: #2d3748;
            font-size: 0.75em;
            font-weight: 500;
        }
        
        .progress-fill.over {
            background: linear-gradient(135deg, #fc8181 0%, #f56565 100%);
            color: #ffffff;
        }
        
        .progress-fill.ok {
            background: linear-gradient(135deg, #68d391 0%, #48bb78 100%);
            color: #ffffff;
        }
        
        .summary {
            background: linear-gradient(135deg, #fef5e7 0%, #fef9e7 100%);
            border: none;
            border-radius: 16px;
            padding: 32px;
            margin-top: 32px;
            display: grid;
            grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
            gap: 24px;
            box-shadow: 0 2px 8px rgba(0,0,0,0.04);
        }
        
        .summary-item {
            text-align: center;
            padding: 20px;
            background: rgba(255, 255, 255, 0.6);
            border-radius: 12px;
        }
        
        .summary-value {
            font-size: 2.2em;
            font-weight: 300;
            margin-bottom: 8px;
            color: #2d3748;
        }
        
        .summary-label {
            font-size: 0.85em;
            color: #718096;
            font-weight: 500;
        }
        
        .dashboard-card {
            background: #ffffff;
            border: 1.5px solid #e2e8f0;
            border-radius: 16px;
            padding: 24px;
            text-align: center;
            transition: all 0.2s;
            box-shadow: 0 2px 4px rgba(0,0,0,0.02);
        }
        
        .dashboard-card:hover {
            border-color: #81e6d9;
            box-shadow: 0 4px 12px rgba(0,0,0,0.08);
            transform: translateY(-2px);
        }
        
        .dashboard-card.triggered {
            border-color: #fc8181;
            background: #fff5f5;
        }
        
        .dashboard-card.ok {
            border-color: #68d391;
            background: #f0fff4;
        }
        
        .dashboard-card-value {
            font-size: 2.5em;
            font-weight: 300;
            color: #2d3748;
            margin: 12px 0;
        }
        
        .dashboard-card-label {
            font-size: 0.9em;
            color: #718096;
            font-weight: 500;
            text-transform: uppercase;
            letter-spacing: 0.5px;
        }
        
        .dashboard-card-icon {
            font-size: 2em;
            margin-bottom: 8px;
        }
    </style>
</head>
<body>
    <div class="top-header">
        <a href="/" class="logo-container">
            <img src="/assets/steep-logo.svg" alt="Steep Logo">
        </a>
        <nav class="header-nav">
            <a href="#" class="nav-tab active" data-tab="dashboard" onclick="switchTab('dashboard'); return false;">Dashboard</a>
            <a href="#" class="nav-tab" data-tab="alerts" onclick="switchTab('alerts'); return false;">Alerts</a>
            <a href="#" class="nav-tab" data-tab="catalog" onclick="switchTab('catalog'); return false;">Metric Catalog</a>
            <a href="#" class="nav-tab" data-tab="config" onclick="switchTab('config'); return false;">Configuration</a>
        </nav>
    </div>
    
    <div class="container">
        <div class="main-content">
            <!-- Dashboard Tab Content -->
            <div id="dashboard-tab" class="tab-content active">
                <div class="page-header">
                    <h1 class="page-title">Dashboard</h1>
                    <p class="page-subtitle">Overview of your alerts and metrics</p>
                </div>
                
                <div class="form-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 24px;">
                        <h2 style="margin: 0;">📊 Alert Summary</h2>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                            <button type="button" class="btn" onclick="runAlertsFromDashboard()" style="max-width: 200px;">
                                🚀 Run Alerts Check
                            </button>
                            <div id="cacheTimestamp" style="font-size: 0.75em; color: #a0aec0; text-align: right; margin-top: 4px;">
                                <!-- Cache timestamp will be shown here -->
                            </div>
                        </div>
                    </div>
                    <div style="margin-bottom: 16px; padding: 12px; background: #f7fafc; border-radius: 8px; font-size: 0.9em; color: #718096;">
                        💡 <strong>Run Alerts Check</strong> executes a new check and updates the dashboard automatically. Cache expires after 24 hours.
                    </div>
                    
                    <div id="dashboardSummary" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 20px; margin-bottom: 32px;">
                        <!-- Summary cards will be inserted here -->
                    </div>
                    
                    <div id="dashboardAlerts" style="margin-top: 32px;">
                        <!-- Recent alert results will be shown here -->
                    </div>
                </div>
            </div>
            
            <!-- Configuration Tab Content -->
            <div id="config-tab" class="tab-content">
                <div class="page-header">
                    <h1 class="page-title">Configuration</h1>
                    <p class="page-subtitle">Configure your Steep API connection and workspace settings</p>
                </div>
                
                <div class="form-section">
                    <h2>🔑 API Configuration</h2>
                    <div class="form-group">
                        <label for="apiKey">Steep API Key *</label>
                        <input type="password" id="apiKey" placeholder="Paste your Steep API key here" required>
                        <small>Your API key is stored in memory only (not saved to disk). If you have a saved key, it will load automatically.</small>
                    </div>
                    <div class="form-group">
                        <label for="apiBaseUrl">API Base URL</label>
                        <input type="text" id="apiBaseUrl" value="https://api.steep.app" placeholder="https://api.steep.app">
                        <small>Leave as default unless using a custom Steep instance</small>
                    </div>
                    <div class="form-group">
                        <label for="workspaceId">Workspace ID</label>
                        <input type="text" id="workspaceId" placeholder="e.g., gYpDNcw-n7i3">
                        <small>Your Steep workspace ID (used for metric links). Find it in your Steep web app URL.</small>
                    </div>
                    <div style="margin-top: 24px;">
                        <button type="button" class="btn" onclick="saveApiConfig()" style="max-width: 200px;">
                            💾 Save Configuration
                        </button>
                        <small style="display: block; margin-top: 8px; color: #718096;">Configuration is saved locally and shared across all tabs</small>
                    </div>
                </div>
            </div>
            
            <!-- Alerts Tab Content -->
            <div id="alerts-tab" class="tab-content">
                <div class="page-header">
                    <h1 class="page-title">Metric Alerts</h1>
                    <p class="page-subtitle">Monitor your metrics and get notified when thresholds are exceeded</p>
                </div>
        
        <div class="form-section">
            <h2>🔍 Metric Explorer</h2>
            <div style="margin-bottom: 16px;">
                <button type="button" class="btn btn-secondary" onclick="loadMetrics()" style="max-width: 200px;">
                    📋 Load Metrics
                </button>
            </div>
            <div id="metricsExplorer" style="display: none;">
                <div class="form-group" style="margin-bottom: 16px;">
                    <input type="text" id="metricSearch" placeholder="Search metrics..." style="width: 100%;" oninput="filterMetrics()">
                </div>
                <div id="metricsList" style="max-height: 400px; overflow-y: auto; border: 1px solid #e2e8f0; border-radius: 12px; padding: 16px; background: #f7fafc;"></div>
            </div>
        </div>
        
        <div class="form-section">
            <h2>📊 Alert Configuration</h2>
            <div id="alertsList"></div>
            <div style="display: flex; gap: 10px; margin-top: 10px;">
                <button type="button" class="btn btn-secondary" onclick="addAlert()" style="max-width: 200px;">
                    ➕ Add Alert
                </button>
                <button type="button" class="btn btn-secondary" onclick="loadFromConfig()" style="max-width: 200px;">
                    📂 Load from Config
                </button>
            </div>
        </div>
        
        <div class="form-section">
            <div style="display: flex; gap: 10px;">
                <button class="btn" id="runBtn" onclick="runAlerts()" style="flex: 1;">
                    🚀 Run Alerts Check
                </button>
                <button class="btn btn-secondary" id="saveBtn" onclick="saveConfig()" style="flex: 1; max-width: 300px;">
                    💾 Save to Config File
                </button>
            </div>
            <div class="status" id="status"></div>
        </div>
        
        <div class="results" id="results">
            <h2 style="margin: 0 0 24px 0; color: #2d3748; font-size: 1.1em; font-weight: 500;">Alert Results</h2>
            <div id="alertsContainer"></div>
            <div class="summary" id="summary"></div>
        </div>
            </div>
            
            <!-- Metric Catalog Tab Content -->
            <div id="catalog-tab" class="tab-content">
                <div class="page-header">
                    <h1 class="page-title">Metric Catalog</h1>
                    <p class="page-subtitle">Browse and explore all available metrics in your Steep workspace</p>
                </div>
                
                <div class="form-section">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
                        <h2 style="margin: 0;">📚 Metric Library</h2>
                        <div style="display: flex; flex-direction: column; align-items: flex-end; gap: 8px;">
                            <div style="display: flex; gap: 8px;">
                                <button type="button" class="btn btn-secondary" onclick="clearCacheAndReload()" style="max-width: 150px;">
                                    🔄 Refresh
                                </button>
                                <button type="button" class="btn" onclick="loadCatalogMetrics()" style="max-width: 200px;">
                                    📋 Load All Metrics
                                </button>
                            </div>
                            <div id="catalogCacheTimestamp" style="font-size: 0.75em; color: #a0aec0; text-align: right; margin-top: 4px;">
                                <!-- Cache timestamp will be shown here -->
                            </div>
                        </div>
                    </div>
                    <div class="form-group" style="margin-bottom: 16px;">
                        <input type="text" id="catalogMetricSearch" placeholder="Search metrics by name, identifier, or description..." style="width: 100%;" oninput="filterCatalogMetrics()">
                    </div>
                </div>
                
                <div class="form-section" id="catalogMetricsSection" style="display: none;">
                    <div id="catalogMetricsList"></div>
                </div>
            </div>
        </div>
    </div>
        </div>
    </div>
    
    <script>
        let alertCount = 0;
        
        // Cache configuration
        const CACHE_CONFIG = {
            METRICS_TTL: 24 * 60 * 60 * 1000, // 24 hours (1 day) for metrics list
            TREND_TTL: 24 * 60 * 60 * 1000,   // 24 hours (1 day) for trend data
            CACHE_PREFIX: 'steep_cache_'
        };
        
        // Cache helper functions
        function getCachedMetrics(apiKey, apiBaseUrl) {
            try {
                const cacheKey = \`\${CACHE_CONFIG.CACHE_PREFIX}metrics_\${apiKey}_\${apiBaseUrl}\`;
                const cached = localStorage.getItem(cacheKey);
                if (!cached) return null;
                
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                
                if (age > CACHE_CONFIG.METRICS_TTL) {
                    localStorage.removeItem(cacheKey);
                    return null;
                }
                
                return data;
            } catch (e) {
                console.error('Error reading metrics cache:', e);
                return null;
            }
        }
        
        function setCachedMetrics(apiKey, apiBaseUrl, data) {
            try {
                const cacheKey = \`\${CACHE_CONFIG.CACHE_PREFIX}metrics_\${apiKey}_\${apiBaseUrl}\`;
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: data,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error('Error writing metrics cache:', e);
            }
        }
        
        function getCachedTrend(metricId) {
            try {
                const cacheKey = \`\${CACHE_CONFIG.CACHE_PREFIX}trend_\${metricId}\`;
                const cached = localStorage.getItem(cacheKey);
                if (!cached) return null;
                
                const { data, timestamp } = JSON.parse(cached);
                const age = Date.now() - timestamp;
                
                if (age > CACHE_CONFIG.TREND_TTL) {
                    localStorage.removeItem(cacheKey);
                    return null;
                }
                
                return data;
            } catch (e) {
                console.error('Error reading trend cache:', e);
                return null;
            }
        }
        
        function setCachedTrend(metricId, trendData) {
            try {
                const cacheKey = \`\${CACHE_CONFIG.CACHE_PREFIX}trend_\${metricId}\`;
                localStorage.setItem(cacheKey, JSON.stringify({
                    data: trendData,
                    timestamp: Date.now()
                }));
            } catch (e) {
                console.error('Error writing trend cache:', e);
            }
        }
        
        // Helper function to create mini trend line SVG
        function createMiniTrendChart(dataPoints) {
            if (!dataPoints || dataPoints.length < 2) return '';
            
            const width = 400;
            const height = 120;
            const padding = 12;
            const chartWidth = width - (padding * 2);
            const chartHeight = height - (padding * 2);
            
            // Get min and max values for scaling
            const values = dataPoints.map(p => p.metric || 0);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const range = maxValue - minValue || 1; // Avoid division by zero
            
            // Create path points
            const points = dataPoints.map((point, index) => {
                const x = padding + (index / (dataPoints.length - 1)) * chartWidth;
                const normalizedValue = (point.metric || 0) - minValue;
                const y = padding + chartHeight - (normalizedValue / range) * chartHeight;
                return \`\${x},\${y}\`;
            });
            
            const pathData = \`M \${points.join(' L ')}\`;
            
            // Determine color based on trend (first vs last)
            const firstValue = values[0];
            const lastValue = values[values.length - 1];
            
            // Check if values are essentially the same (within 1% difference)
            const percentChange = firstValue !== 0 ? Math.abs((lastValue - firstValue) / firstValue) : 0;
            const isNeutral = percentChange < 0.01 || Math.abs(lastValue - firstValue) < 0.01;
            
            const isUp = !isNeutral && lastValue > firstValue;
            const isDown = !isNeutral && lastValue < firstValue;
            const strokeColor = isNeutral ? '#a0aec0' : (isUp ? '#48bb78' : '#f56565');
            
            // Format values for display - more intuitive
            const formatValue = (val) => {
                if (val === 0) return '0';
                const absVal = Math.abs(val);
                
                // For very large numbers, use M/B
                if (absVal >= 1000000000) {
                    return (val / 1000000000).toFixed(1) + 'B';
                }
                if (absVal >= 1000000) {
                    return (val / 1000000).toFixed(1) + 'M';
                }
                // For thousands, show 1 decimal if needed, otherwise whole number
                if (absVal >= 1000) {
                    const kVal = val / 1000;
                    return kVal % 1 === 0 ? kVal.toFixed(0) + 'K' : kVal.toFixed(1) + 'K';
                }
                // For numbers less than 1000, show 1 decimal if needed
                return val % 1 === 0 ? val.toFixed(0) : val.toFixed(1);
            };
            
            const firstFormatted = formatValue(firstValue);
            const lastFormatted = formatValue(lastValue);
            
            // Calculate text positions - always centered vertically
            const firstX = padding + 4;
            const firstY = padding + chartHeight / 2; // Always in the middle
            const lastX = width - padding - 4;
            const lastY = padding + chartHeight / 2; // Always in the middle
            
            // Text color matches the line color
            const textColor = strokeColor;
            
            // Calculate background box dimensions (approximate based on text length)
            const boxHeight = 20;
            const firstBoxWidth = Math.max(40, firstFormatted.length * 8 + 8);
            const lastBoxWidth = Math.max(40, lastFormatted.length * 8 + 8);
            
            // Position boxes centered on the text
            const firstBoxX = firstX - 4;
            const firstBoxY = firstY - boxHeight / 2;
            const lastBoxX = lastX - lastBoxWidth + 4;
            const lastBoxY = lastY - boxHeight / 2;
            
            return \`
                <svg class="mini-trend-chart" viewBox="0 0 \${width} \${height}" xmlns="http://www.w3.org/2000/svg">
                    <path d="\${pathData}" 
                          stroke="\${strokeColor}" 
                          stroke-width="4" 
                          fill="none" 
                          stroke-linecap="round" 
                          stroke-linejoin="round"/>
                    <!-- Background boxes for numbers -->
                    <rect x="\${firstBoxX}" y="\${firstBoxY}" 
                          width="\${firstBoxWidth}" height="\${boxHeight}" 
                          fill="#ffffff" 
                          fill-opacity="0.9" 
                          stroke="\${textColor}" 
                          stroke-width="1" 
                          rx="4"/>
                    <rect x="\${lastBoxX}" y="\${lastBoxY}" 
                          width="\${lastBoxWidth}" height="\${boxHeight}" 
                          fill="#ffffff" 
                          fill-opacity="0.9" 
                          stroke="\${textColor}" 
                          stroke-width="1" 
                          rx="4"/>
                    <!-- Numbers on top of boxes -->
                    <text x="\${firstX}" y="\${firstY}" 
                          font-size="13" 
                          font-weight="600" 
                          fill="\${textColor}" 
                          text-anchor="start" 
                          dominant-baseline="middle">\${firstFormatted}</text>
                    <text x="\${lastX}" y="\${lastY}" 
                          font-size="13" 
                          font-weight="600" 
                          fill="\${textColor}" 
                          text-anchor="end" 
                          dominant-baseline="middle">\${lastFormatted}</text>
                </svg>
            \`;
        }
        
        function clearAllCache() {
            try {
                const keys = Object.keys(localStorage);
                keys.forEach(key => {
                    if (key.startsWith(CACHE_CONFIG.CACHE_PREFIX)) {
                        localStorage.removeItem(key);
                    }
                });
                return true;
            } catch (e) {
                console.error('Error clearing cache:', e);
                return false;
            }
        }
        
        function clearCacheAndReload() {
            if (confirm('🔄 Clear all cached data and reload metrics?')) {
                clearAllCache();
                // Clear timestamp display
                const catalogCacheTimestampEl = document.getElementById('catalogCacheTimestamp');
                if (catalogCacheTimestampEl) {
                    catalogCacheTimestampEl.innerHTML = '<span style="color: #a0aec0;">📦 No cached data</span>';
                }
                loadCatalogMetrics();
            }
        }
        
        function updateCatalogCacheTimestamp(apiKey, apiBaseUrl) {
            const catalogCacheTimestampEl = document.getElementById('catalogCacheTimestamp');
            if (!catalogCacheTimestampEl) return;
            
            try {
                const cacheKey = \`\${CACHE_CONFIG.CACHE_PREFIX}metrics_\${apiKey}_\${apiBaseUrl}\`;
                const cached = localStorage.getItem(cacheKey);
                if (cached) {
                    const { timestamp } = JSON.parse(cached);
                    const cacheDate = new Date(timestamp);
                    const age = Date.now() - timestamp;
                    const ageHours = Math.floor(age / (60 * 60 * 1000));
                    const ageMinutes = Math.floor((age % (60 * 60 * 1000)) / (60 * 1000));
                    const isExpired = age >= CACHE_CONFIG.METRICS_TTL;
                    
                    let ageText = '';
                    if (ageHours > 0) {
                        ageText = \`\${ageHours}h \${ageMinutes}m ago\`;
                    } else {
                        ageText = \`\${ageMinutes}m ago\`;
                    }
                    
                    catalogCacheTimestampEl.innerHTML = \`
                        <span style="color: \${isExpired ? '#f56565' : '#718096'};">📦 Cached: \${cacheDate.toLocaleTimeString()} (\${ageText})</span>
                    \`;
                } else {
                    catalogCacheTimestampEl.innerHTML = '<span style="color: #a0aec0;">📦 No cached data</span>';
                }
            } catch (e) {
                console.warn('Could not read cache timestamp:', e);
                catalogCacheTimestampEl.innerHTML = '<span style="color: #a0aec0;">📦 No cached data</span>';
            }
        }
        
        function addAlert() {
            alertCount++;
            const alertsList = document.getElementById('alertsList');
            const alertDiv = document.createElement('div');
            alertDiv.className = 'alert-item';
            alertDiv.id = 'alert-' + alertCount;
            alertDiv.innerHTML = \`
                <div class="alert-item-header" onclick="toggleAlert(\${alertCount})" style="cursor: pointer;">
                    <div style="display: flex; align-items: center; gap: 8px;">
                        <span class="alert-toggle-icon" id="toggle-icon-\${alertCount}" style="font-size: 0.8em; transition: transform 0.2s;">▼</span>
                        <div class="alert-item-title" id="alert-title-\${alertCount}">Alert #\${alertCount}</div>
                    </div>
                    <button type="button" class="btn-remove" onclick="event.stopPropagation(); removeAlert(\${alertCount})">Remove</button>
                </div>
                <div class="alert-item-content" id="alert-content-\${alertCount}">
                <div class="form-group">
                    <label>Alert Name</label>
                    <input type="text" name="alert-name-\${alertCount}" placeholder="e.g., High Ad Spend Alert" required>
                </div>
                <div class="form-group">
                    <label>Metric Identifier *</label>
                    <input type="text" name="metric-identifier-\${alertCount}" placeholder="e.g., ad_spend" required>
                    <small>The metric identifier from your Steep modules</small>
                </div>
                <div class="form-row">
                    <div class="form-group">
                        <label>Threshold *</label>
                        <input type="number" name="threshold-\${alertCount}" placeholder="10000" step="0.01" required>
                    </div>
                    <div class="form-group">
                        <label>Operator *</label>
                        <select name="operator-\${alertCount}" required>
                            <option value=">">Greater than (>)</option>
                            <option value="<">Less than (<)</option>
                            <option value=">=">Greater or equal (>=)</option>
                            <option value="<=">Less or equal (<=)</option>
                            <option value="==">Equal (==)</option>
                        </select>
                    </div>
                </div>
                <div class="form-group">
                    <label>Time Period *</label>
                    <select name="time-period-\${alertCount}" required>
                        <option value="daily">Daily (yesterday)</option>
                        <option value="weekly">Weekly (last 7 days)</option>
                        <option value="monthly">Monthly (last 30 days)</option>
                    </select>
                    <small>Check if metric exceeds threshold over this time period</small>
                </div>
                <div class="form-group">
                    <label>Email Addresses (comma-separated)</label>
                    <input type="text" name="emails-\${alertCount}" placeholder="team@company.com, manager@company.com">
                    <small>Who should be notified when this alert triggers</small>
                </div>
                </div>
            \`;
            alertsList.appendChild(alertDiv);
            
            // Set up title update listener
            setTimeout(() => updateAlertTitle(alertCount), 0);
        }
        
        function removeAlert(id) {
            const alertDiv = document.getElementById('alert-' + id);
            if (alertDiv) {
                alertDiv.remove();
            }
        }
        
        function toggleAlert(id) {
            const content = document.getElementById('alert-content-' + id);
            const icon = document.getElementById('toggle-icon-' + id);
            if (content && icon) {
                const isCollapsed = content.classList.contains('collapsed');
                if (isCollapsed) {
                    content.classList.remove('collapsed');
                    icon.classList.remove('collapsed');
                } else {
                    content.classList.add('collapsed');
                    icon.classList.add('collapsed');
                }
            }
        }
        
        // Update alert title when name changes
        function updateAlertTitle(id) {
            const alertItem = document.getElementById('alert-' + id);
            if (alertItem) {
                const nameInput = alertItem.querySelector('[name="alert-name-' + id + '"]');
                const titleElement = document.getElementById('alert-title-' + id);
                if (nameInput && titleElement) {
                    const name = nameInput.value.trim();
                    titleElement.textContent = name || 'Alert #' + id;
                    
                    // Also update on input
                    nameInput.addEventListener('input', function() {
                        const newName = this.value.trim();
                        titleElement.textContent = newName || 'Alert #' + id;
                    });
                }
            }
        }
        
        // Load existing config and API key on page load
        window.onload = async function() {
            // Try to load saved API key
            try {
                const keyResponse = await fetch('/api/load-api-key');
                const keyData = await keyResponse.json();
                if (keyData.success && keyData.api_key) {
                    document.getElementById('apiKey').value = keyData.api_key;
                }
            } catch (error) {
                // No saved key, that's okay
            }
            
            await loadFromConfig();
            if (document.querySelectorAll('.alert-item').length === 0) {
                addAlert(); // Add first alert if none loaded
            }
            
            // Load dashboard data
            refreshDashboard();
        };
        
        // Shutdown server when browser closes
        window.addEventListener('beforeunload', function() {
            // Use sendBeacon for reliable delivery even if page is closing
            navigator.sendBeacon('/api/shutdown', '');
        });
        
        async function loadFromConfig() {
            try {
                const response = await fetch('/api/load-config');
                const data = await response.json();
                
                if (data.success && data.alerts && data.alerts.length > 0) {
                    // Clear existing alerts
                    document.getElementById('alertsList').innerHTML = '';
                    alertCount = 0;
                    
                    // Load each alert
                    data.alerts.forEach(alert => {
                        addAlert();
                        const id = alertCount;
                        const item = document.getElementById('alert-' + id);
                        if (item) {
                            item.querySelector('[name="alert-name-' + id + '"]').value = alert.name || '';
                            item.querySelector('[name="metric-identifier-' + id + '"]').value = alert.metric_identifier || '';
                            item.querySelector('[name="threshold-' + id + '"]').value = alert.threshold || '';
                            item.querySelector('[name="operator-' + id + '"]').value = alert.operator || '>';
                            item.querySelector('[name="time-period-' + id + '"]').value = alert.time_period || 'daily';
                            item.querySelector('[name="emails-' + id + '"]').value = (alert.alert_to_emails || []).join(', ');
                            
                            // Update title after setting the name
                            setTimeout(() => updateAlertTitle(id), 0);
                        }
                    });
                    
                    // Load API base URL if available
                    if (data.api_base_url) {
                        document.getElementById('apiBaseUrl').value = data.api_base_url;
                    }
                    
                    // Load workspace ID if available
                    if (data.workspace_id) {
                        document.getElementById('workspaceId').value = data.workspace_id;
                    }
                    
                    status.className = 'status success';
                    status.textContent = '✅ Loaded ' + data.alerts.length + ' alert(s) from config file';
                    setTimeout(() => {
                        status.className = 'status';
                        status.textContent = '';
                    }, 3000);
                }
            } catch (error) {
                console.log('No config file found or error loading:', error);
                // If no config, just add a default alert
                if (document.querySelectorAll('.alert-item').length === 0) {
                    addAlert();
                }
            }
        }
        
        async function saveConfig() {
            const btn = document.getElementById('saveBtn');
            const status = document.getElementById('status');
            
            // Get API base URL and workspace ID
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            const workspaceId = document.getElementById('workspaceId').value.trim();
            
            // Collect alerts
            const alerts = [];
            const alertItems = document.querySelectorAll('.alert-item');
            
            if (alertItems.length === 0) {
                status.className = 'status error';
                status.textContent = '❌ Please add at least one alert to save';
                return;
            }
            
            alertItems.forEach((item) => {
                const id = item.id.replace('alert-', '');
                const name = item.querySelector('[name="alert-name-' + id + '"]').value.trim();
                const metricIdentifier = item.querySelector('[name="metric-identifier-' + id + '"]').value.trim();
                const threshold = parseFloat(item.querySelector('[name="threshold-' + id + '"]').value);
                const operator = item.querySelector('[name="operator-' + id + '"]').value;
                const timePeriodEl = item.querySelector('[name="time-period-' + id + '"]');
                const timePeriod = timePeriodEl ? timePeriodEl.value || 'daily' : 'daily';
                const emailsText = item.querySelector('[name="emails-' + id + '"]').value.trim();
                
                if (!name || !metricIdentifier || isNaN(threshold)) {
                    return; // Skip invalid alerts
                }
                
                const emails = emailsText ? emailsText.split(',').map(e => e.trim()).filter(e => e) : [];
                
                alerts.push({
                    name: name,
                    metric_identifier: metricIdentifier,
                    threshold: threshold,
                    operator: operator,
                    time_period: timePeriod,
                    alert_to_emails: emails.length > 0 ? emails : []
                });
            });
            
            if (alerts.length === 0) {
                status.className = 'status error';
                status.textContent = '❌ Please fill in all required fields for at least one alert';
                return;
            }
            
            btn.disabled = true;
            status.className = 'status loading';
            status.textContent = '💾 Saving configuration...';
            
            try {
                const response = await fetch('/api/save-config', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_base_url: apiBaseUrl,
                        workspace_id: workspaceId,
                        alerts: alerts
                    })
                });
                
                const data = await response.json();
                
                if (data.success) {
                    // Also save API key if provided
                    const apiKey = document.getElementById('apiKey').value.trim();
                    if (apiKey) {
                        try {
                            await fetch('/api/save-api-key', {
                                method: 'POST',
                                headers: {
                                    'Content-Type': 'application/json'
                                },
                                body: JSON.stringify({
                                    api_key: apiKey
                                })
                            });
                        } catch (error) {
                            // API key save is optional, don't fail the whole save
                            console.log('Could not save API key:', error);
                        }
                    }
                    
                    status.className = 'status success';
                    status.textContent = '✅ Configuration saved to alerts.yaml!';
                } else {
                    throw new Error(data.error || 'Failed to save configuration');
                }
            } catch (error) {
                status.className = 'status error';
                status.textContent = '❌ Error: ' + error.message;
            } finally {
                btn.disabled = false;
            }
        }
        
        async function runAlertsFromDashboard() {
            // Run alerts but stay on dashboard - show results in dashboard
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            
            if (!apiKey) {
                alert('❌ Please enter your Steep API key in the Configuration tab');
                return;
            }
            
            // Collect alerts
            const alerts = [];
            const alertItems = document.querySelectorAll('.alert-item');
            
            if (alertItems.length === 0) {
                alert('❌ Please add at least one alert in the Alerts tab');
                return;
            }
            
            alertItems.forEach((item, index) => {
                const id = item.id.replace('alert-', '');
                const name = item.querySelector('[name="alert-name-' + id + '"]')?.value.trim();
                const metricIdentifier = item.querySelector('[name="metric-identifier-' + id + '"]')?.value.trim();
                const threshold = parseFloat(item.querySelector('[name="threshold-' + id + '"]')?.value);
                const operator = item.querySelector('[name="operator-' + id + '"]')?.value;
                const timePeriod = item.querySelector('[name="time-period-' + id + '"]')?.value || 'daily';
                const emailsText = item.querySelector('[name="emails-' + id + '"]')?.value.trim();
                
                if (!name || !metricIdentifier || isNaN(threshold)) {
                    return; // Skip invalid alerts
                }
                
                const emails = emailsText ? emailsText.split(',').map(e => e.trim()).filter(e => e) : [];
                
                alerts.push({
                    name: name || \`Alert #\${index + 1}\`,
                    metric_identifier: metricIdentifier,
                    threshold: threshold,
                    operator: operator,
                    time_period: timePeriod,
                    alert_to_emails: emails.length > 0 ? emails : ['no-email@example.com']
                });
            });
            
            if (alerts.length === 0) {
                alert('❌ Please fill in all required fields for at least one alert');
                return;
            }
            
            // Show loading state
            const summaryEl = document.getElementById('dashboardSummary');
            const alertsEl = document.getElementById('dashboardAlerts');
            alertsEl.innerHTML = '<div style="text-align: center; padding: 40px; color: #718096;"><div style="font-size: 2em; margin-bottom: 16px;">⏳</div><div>Checking alerts...</div></div>';
            
            try {
                const response = await fetch('/api/check-alerts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_base_url: apiBaseUrl,
                        alerts: alerts
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to check alerts');
                }
                
                const data = await response.json();
                
                // Store results in localStorage for dashboard
                try {
                    localStorage.setItem('steep_last_alert_results', JSON.stringify({
                        data: data,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('Could not save alert results to localStorage:', e);
                }
                
                // Refresh dashboard to show results
                refreshDashboard();
                
            } catch (error) {
                alertsEl.innerHTML = \`<div style="text-align: center; padding: 40px; color: #e53e3e;"><div style="font-size: 2em; margin-bottom: 16px;">❌</div><div>Error: \${error.message}</div></div>\`;
            }
        }
        
        async function runAlerts() {
            const btn = document.getElementById('runBtn');
            const status = document.getElementById('status');
            const results = document.getElementById('results');
            const container = document.getElementById('alertsContainer');
            const summary = document.getElementById('summary');
            
            // Get API key
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            
            if (!apiKey) {
                status.className = 'status error';
                status.textContent = '❌ Please enter your Steep API key';
                return;
            }
            
            // Collect alerts
            const alerts = [];
            const alertItems = document.querySelectorAll('.alert-item');
            
            if (alertItems.length === 0) {
                status.className = 'status error';
                status.textContent = '❌ Please add at least one alert';
                return;
            }
            
            alertItems.forEach((item, index) => {
                const id = item.id.replace('alert-', '');
                const name = item.querySelector('[name="alert-name-' + id + '"]').value.trim();
                const metricIdentifier = item.querySelector('[name="metric-identifier-' + id + '"]').value.trim();
                const threshold = parseFloat(item.querySelector('[name="threshold-' + id + '"]').value);
                const operator = item.querySelector('[name="operator-' + id + '"]').value;
                const timePeriod = item.querySelector('[name="time-period-' + id + '"]').value || 'daily';
                const emailsText = item.querySelector('[name="emails-' + id + '"]').value.trim();
                
                if (!name || !metricIdentifier || isNaN(threshold)) {
                    return; // Skip invalid alerts
                }
                
                const emails = emailsText ? emailsText.split(',').map(e => e.trim()).filter(e => e) : [];
                
                alerts.push({
                    name: name || \`Alert #\${index + 1}\`,
                    metric_identifier: metricIdentifier,
                    threshold: threshold,
                    operator: operator,
                    time_period: timePeriod,
                    alert_to_emails: emails.length > 0 ? emails : ['no-email@example.com']
                });
            });
            
            if (alerts.length === 0) {
                status.className = 'status error';
                status.textContent = '❌ Please fill in all required fields for at least one alert';
                return;
            }
            
            // Disable button and show loading
            btn.disabled = true;
            status.className = 'status loading';
            status.textContent = '⏳ Checking alerts... This may take a moment.';
            results.classList.remove('show');
            
            try {
                const response = await fetch('/api/check-alerts', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_base_url: apiBaseUrl,
                        alerts: alerts
                    })
                });
                
                if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to check alerts');
                }
                
                const data = await response.json();
                
                // Store results in localStorage for dashboard
                try {
                    localStorage.setItem('steep_last_alert_results', JSON.stringify({
                        data: data,
                        timestamp: Date.now()
                    }));
                } catch (e) {
                    console.warn('Could not save alert results to localStorage:', e);
                }
                
                // Show results
                displayResults(data);
                status.className = 'status success';
                status.textContent = '✅ Alerts check completed!';
                
                // Refresh dashboard (it will update when user switches to it)
                refreshDashboard();
                
            } catch (error) {
                status.className = 'status error';
                status.textContent = '❌ Error: ' + error.message;
            } finally {
                btn.disabled = false;
            }
        }
        
        function displayResults(data) {
            const container = document.getElementById('alertsContainer');
            const summary = document.getElementById('summary');
            const results = document.getElementById('results');
            
            container.innerHTML = '';
            
            data.results.forEach((result, index) => {
                const card = document.createElement('div');
                let statusClass = 'error';
                let statusText = 'ERROR';
                let statusEmoji = '❌';
                
                if (result.error) {
                    statusClass = 'error';
                    statusText = 'ERROR';
                    statusEmoji = '❌';
                } else if (result.triggered) {
                    statusClass = 'triggered';
                    statusText = 'TRIGGERED';
                    statusEmoji = '🔴';
                } else {
                    statusClass = 'ok';
                    statusText = 'OK';
                    statusEmoji = '✅';
                }
                
                const percentage = result.metric_value !== null && result.threshold > 0
                    ? ((result.metric_value / result.threshold) * 100).toFixed(1)
                    : 0;
                
                card.className = 'alert-card ' + statusClass;
                card.innerHTML = \`
                    <div class="alert-header">
                        <div class="alert-name">\${statusEmoji} \${result.alert.name}</div>
                        <div class="alert-status \${statusClass}">\${statusText}</div>
                    </div>
                    <div class="alert-details">
                        <div class="detail-item">
                            <div class="detail-label">Metric</div>
                            <div class="detail-value">\${result.alert.metric_identifier}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Time Period</div>
                            <div class="detail-value">\${result.alert.time_period || 'daily'}</div>
                        </div>
                        \${result.metric_value !== null ? \`
                        <div class="detail-item">
                            <div class="detail-label">Current Value</div>
                            <div class="detail-value">\${formatNumber(result.metric_value)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Threshold</div>
                            <div class="detail-value">\${formatNumber(result.threshold)}</div>
                        </div>
                        <div class="detail-item">
                            <div class="detail-label">Percentage</div>
                            <div class="detail-value">\${percentage}%</div>
                        </div>
                        \` : \`
                        <div class="detail-item">
                            <div class="detail-label">Error</div>
                            <div class="detail-value" style="color: #f44336;">\${result.error || 'No data'}</div>
                        </div>
                        \`}
                    </div>
                    \${result.metric_value !== null && result.threshold > 0 ? \`
                    <div class="progress-bar">
                        <div class="progress-fill \${result.triggered ? 'over' : 'ok'}" 
                             style="width: \${Math.min(100, percentage)}%">
                            \${percentage}%
                        </div>
                    </div>
                    \` : ''}
                    <div style="margin-top: 16px; font-size: 0.85em; color: #718096; padding-top: 16px; border-top: 1px solid #e2e8f0;">
                        Will notify: \${result.alert.alert_to_emails.join(', ')}
                    </div>
                \`;
                
                container.appendChild(card);
            });
            
            // Summary
            const triggered = data.results.filter(r => r.triggered).length;
            const errors = data.results.filter(r => r.error).length;
            const ok = data.results.length - triggered - errors;
            
            summary.innerHTML = \`
                <div class="summary-item">
                    <div class="summary-value">\${data.results.length}</div>
                    <div class="summary-label">Total Alerts</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value" style="color: #48bb78;">\${ok}</div>
                    <div class="summary-label">All Good</div>
                </div>
                <div class="summary-item">
                    <div class="summary-value" style="color: #f56565;">\${triggered}</div>
                    <div class="summary-label">Triggered</div>
                </div>
                \${errors > 0 ? \`
                <div class="summary-item">
                    <div class="summary-value" style="color: #ed8936;">\${errors}</div>
                    <div class="summary-label">Errors</div>
                </div>
                \` : ''}
            \`;
            
            results.classList.add('show');
        }
        
        function formatNumber(num) {
            if (num === null || num === undefined) return 'N/A';
            return new Intl.NumberFormat('en-US', {
                minimumFractionDigits: 0,
                maximumFractionDigits: 2
            }).format(num);
        }
        
        let allMetrics = [];
        
        async function loadMetrics() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            const status = document.getElementById('status');
            const explorer = document.getElementById('metricsExplorer');
            const metricsList = document.getElementById('metricsList');
            
            if (!apiKey) {
                status.className = 'status error';
                status.textContent = '❌ Please enter your Steep API key first';
                return;
            }
            
            status.className = 'status loading';
            status.textContent = '📋 Loading metrics...';
            
            try {
                const response = await fetch('/api/list-metrics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_base_url: apiBaseUrl
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch {
                        errorData = { error: errorText || 'Failed to load metrics' };
                    }
                    throw new Error(errorData.error || 'Failed to load metrics');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    allMetrics = data.metrics || [];
                    displayMetrics(allMetrics);
                    explorer.style.display = 'block';
                    status.className = 'status success';
                    status.textContent = \`✅ Loaded \${allMetrics.length} metric(s)\`;
                    setTimeout(() => {
                        status.className = 'status';
                        status.textContent = '';
                    }, 3000);
                } else {
                    throw new Error(data.error || 'Failed to load metrics');
                }
            } catch (error) {
                status.className = 'status error';
                status.textContent = '❌ Error: ' + (error.message || String(error));
                console.error('Error loading metrics:', error);
            }
        }
        
        function displayMetrics(metrics) {
            const metricsList = document.getElementById('metricsList');
            if (metrics.length === 0) {
                metricsList.innerHTML = '<div style="padding: 20px; text-align: center; color: #718096;">No metrics found</div>';
                return;
            }
            
            metricsList.innerHTML = metrics.map((metric, index) => {
                const workspaceId = document.getElementById('workspaceId').value.trim();
                const metricUrl = workspaceId && metric.id 
                    ? \`https://web.steep.app/\${workspaceId}/metrics/\${metric.id}\`
                    : null;
                
                // Escape HTML and quotes properly
                const safeIdentifier = (metric.identifier || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safeId = (metric.id || '').replace(/'/g, "\\'").replace(/"/g, '&quot;');
                const safeLabel = (metric.label || metric.identifier || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                const safeDescription = (metric.description || '').replace(/</g, '&lt;').replace(/>/g, '&gt;');
                
                return \`
                    <div class="metric-item" data-metric-index="\${index}" style="padding: 12px; margin-bottom: 8px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 8px; cursor: pointer; transition: all 0.2s;" 
                         onmouseover="this.style.borderColor='#81e6d9'; this.style.boxShadow='0 2px 4px rgba(0,0,0,0.1)'"
                         onmouseout="this.style.borderColor='#e2e8f0'; this.style.boxShadow='none'">
                        <div style="display: flex; justify-content: space-between; align-items: start;">
                            <div style="flex: 1;">
                                <div style="font-weight: 600; color: #2d3748; margin-bottom: 4px;">\${safeLabel}</div>
                                <div style="font-size: 0.85em; color: #718096; margin-bottom: 4px; font-family: monospace;">\${safeIdentifier}</div>
                                \${safeDescription ? \`<div style="font-size: 0.85em; color: #a0aec0; margin-top: 4px;">\${safeDescription}</div>\` : ''}
                            </div>
                            <div style="display: flex; gap: 8px; align-items: center;">
                                \${metric.id ? \`<a href="\${metricUrl || '#'}" target="_blank" onclick="event.stopPropagation(); \${metricUrl ? '' : 'alert(\\'Please set Workspace ID in API Configuration to view this metric\\'); return false;'}" style="color: #4a5568; text-decoration: none; font-size: 0.85em; padding: 4px 8px; border: 1px solid #e2e8f0; border-radius: 6px; background: #f7fafc;">🔗 View</a>\` : ''}
                                <button type="button" class="metric-use-btn" data-identifier="\${safeIdentifier}" data-metric-id="\${safeId}" style="padding: 4px 12px; background: #81e6d9; color: #2d3748; border: none; border-radius: 6px; font-size: 0.85em; cursor: pointer; font-weight: 500;">Use</button>
                            </div>
                        </div>
                        \${!metric.id ? \`
                        <div style="margin-top: 8px; padding: 8px; background: #fff5e6; border-radius: 6px; font-size: 0.8em; color: #856404;">
                            ⚠️ No metric ID found. You can manually add it in the alert form.
                        </div>
                        \` : ''}
                    </div>
                \`;
            }).join('');
            
            // Add event listeners to metric items and buttons
            metricsList.querySelectorAll('.metric-item').forEach(item => {
                item.addEventListener('click', function(e) {
                    // Don't handle clicks on View link or Use button
                    if (e.target.tagName === 'A' || e.target.classList.contains('metric-use-btn') || e.target.closest('.metric-use-btn') || e.target.closest('a')) {
                        return;
                    }
                    // Clicking the card itself should add to alert
                    const index = parseInt(this.getAttribute('data-metric-index'));
                    const metric = metrics[index];
                    if (metric) {
                        selectMetric(metric.identifier, metric.id || '');
                    }
                });
            });
            
            metricsList.querySelectorAll('.metric-use-btn').forEach(btn => {
                btn.addEventListener('click', function(e) {
                    e.stopPropagation();
                    const identifier = this.getAttribute('data-identifier');
                    const metricId = this.getAttribute('data-metric-id');
                    selectMetric(identifier, metricId);
                });
            });
        }
        
        function filterMetrics() {
            const searchTerm = document.getElementById('metricSearch').value.toLowerCase();
            const filtered = allMetrics.filter(metric => {
                const label = (metric.label || '').toLowerCase();
                const identifier = (metric.identifier || '').toLowerCase();
                const description = (metric.description || '').toLowerCase();
                return label.includes(searchTerm) || identifier.includes(searchTerm) || description.includes(searchTerm);
            });
            displayMetrics(filtered);
        }
        
        function selectMetric(identifier, metricId) {
            // Always create a new alert when selecting a metric
            // This function is called when clicking "Use" or the card - only auto-fills, doesn't open link
            addAlert();
            const targetItem = document.getElementById('alert-' + alertCount);
            
            if (targetItem) {
                const id = alertCount;
                const metricInput = targetItem.querySelector('[name="metric-identifier-' + id + '"]');
                if (metricInput) {
                    metricInput.value = identifier;
                }
                
                // Expand the alert if it's collapsed
                const content = document.getElementById('alert-content-' + id);
                const icon = document.getElementById('toggle-icon-' + id);
                if (content && content.classList.contains('collapsed')) {
                    content.classList.remove('collapsed');
                    if (icon) icon.classList.remove('collapsed');
                }
                
                // Scroll to the newly created alert smoothly
                setTimeout(() => {
                    targetItem.scrollIntoView({ 
                        behavior: 'smooth', 
                        block: 'center' 
                    });
                    // Focus on the alert name input for better UX
                    const nameInput = targetItem.querySelector('[name="alert-name-' + id + '"]');
                    if (nameInput) {
                        nameInput.focus();
                    }
                }, 100);
            }
        }
        
        let catalogMetrics = [];
        
        async function loadCatalogMetrics() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            const catalogSection = document.getElementById('catalogMetricsSection');
            const catalogList = document.getElementById('catalogMetricsList');
            
            if (!apiKey) {
                alert('❌ Please configure your API key in the Configuration tab first');
                switchTab('config');
                return;
            }
            
            // Show initial loading state with animation
            const startTime = Date.now();
            let loadingInterval;
            
            function updateLoadingTimer() {
                const elapsed = Math.floor((Date.now() - startTime) / 1000);
                const timerEl = document.getElementById('loadingTimer');
                if (timerEl) {
                    timerEl.textContent = \`⏱️ \${elapsed}s\`;
                }
            }
            
            catalogList.innerHTML = \`
                <div class="loading-container">
                    <div class="loading-animation">🚶</div>
                    <div style="font-size: 1.1em; font-weight: 500; margin-bottom: 8px;">Loading metrics...</div>
                    <div class="loading-progress" id="loadingProgress">Fetching metric list...</div>
                    <div class="loading-timer" id="loadingTimer">⏱️ 0s</div>
                </div>
            \`;
            catalogSection.style.display = 'block';
            
            // Start timer
            loadingInterval = setInterval(updateLoadingTimer, 1000);
            
            try {
                // Check cache first
                const cachedMetrics = getCachedMetrics(apiKey, apiBaseUrl);
                if (cachedMetrics) {
                    clearInterval(loadingInterval);
                    catalogList.innerHTML = '<div style="padding: 12px; background: #ebf8ff; border-radius: 8px; margin-bottom: 16px; color: #2b6cb0; font-size: 0.9em;">💾 Using cached data (click Refresh to reload)</div>';
                    catalogMetrics = cachedMetrics;
                    updateCatalogCacheTimestamp(apiKey, apiBaseUrl);
                    await displayCatalogMetrics(cachedMetrics);
                    return;
                }
                
                // No cache, fetch from API
                const response = await fetch('/api/list-metrics', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_base_url: apiBaseUrl
                    })
                });
                
                if (!response.ok) {
                    const errorText = await response.text();
                    let errorData;
                    try {
                        errorData = JSON.parse(errorText);
                    } catch {
                        errorData = { error: errorText || 'Failed to load metrics' };
                    }
                    throw new Error(errorData.error || 'Failed to load metrics');
                }
                
                const data = await response.json();
                
                if (data.success) {
                    catalogMetrics = data.metrics || [];
                    // Cache the metrics
                    setCachedMetrics(apiKey, apiBaseUrl, catalogMetrics);
                    // Update cache timestamp display
                    updateCatalogCacheTimestamp(apiKey, apiBaseUrl);
                    // Update progress
                    const progressEl = document.getElementById('loadingProgress');
                    if (progressEl) {
                        progressEl.textContent = \`Found \${catalogMetrics.length} metrics. Loading trend data...\`;
                    }
                    await displayCatalogMetrics(catalogMetrics);
                    clearInterval(loadingInterval);
                } else {
                    clearInterval(loadingInterval);
                    throw new Error(data.error || 'Failed to load metrics');
                }
            } catch (error) {
                clearInterval(loadingInterval);
                catalogList.innerHTML = \`<div style="padding: 20px; text-align: center; color: #e53e3e;">❌ Error: \${error.message || String(error)}</div>\`;
                console.error('Error loading metrics:', error);
            }
        }
        
        async function displayCatalogMetrics(metrics) {
            const catalogList = document.getElementById('catalogMetricsList');
            const workspaceId = document.getElementById('workspaceId').value.trim();
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            
            if (metrics.length === 0) {
                catalogList.innerHTML = '<div style="padding: 20px; text-align: center; color: #718096;">No metrics found</div>';
                return;
            }
            
            // Helper to check if a value looks like an ID
            function isIdLike(value) {
                if (!value) return false;
                const str = String(value);
                // Only filter out IDs that start with dash (like "-MvLw599mS0Y")
                return /^-[A-Za-z0-9]+$/.test(str);
            }
            
            // Group metrics by category
            const metricsByCategory = {};
            
            // Debug: log first few metrics to see category structure
            if (metrics.length > 0) {
                console.log('Sample metric category:', metrics[0].category, typeof metrics[0].category);
            }
            
            metrics.forEach((metric, index) => {
                // Extract category - handle both string and object
                // Be very permissive - only filter out obvious IDs like "-MvLw599mS0Y"
                let category = null;
                if (metric.category) {
                    if (typeof metric.category === 'string') {
                        const catStr = metric.category.trim();
                        // Only filter out if it's clearly an ID (starts with dash and is short alphanumeric)
                        if (!(/^-[A-Za-z0-9]+$/.test(catStr) && catStr.length < 20)) {
                            category = catStr;
                        }
                    } else if (typeof metric.category === 'object' && metric.category !== null) {
                        // If it's an object, try to get label, name, or identifier
                        // Try multiple possible fields
                        const catLabel = metric.category.label || 
                                       metric.category.name || 
                                       metric.category.identifier ||
                                       metric.category.title ||
                                       (metric.category.value && typeof metric.category.value === 'string' ? metric.category.value : null);
                        if (catLabel) {
                            const catStr = String(catLabel).trim();
                            // Only filter out if it's clearly an ID (starts with dash)
                            if (!(/^-[A-Za-z0-9]+$/.test(catStr))) {
                                category = catStr;
                            }
                        }
                    }
                }
                
                // Use category if we have one, otherwise use "Uncategorized"
                const finalCategory = category || 'Uncategorized';
                
                if (!metricsByCategory[finalCategory]) {
                    metricsByCategory[finalCategory] = [];
                }
                metricsByCategory[finalCategory].push({ metric, index });
            });
            
            // Helper function to render a single metric card (with loading indicator for trend)
            function renderMetricCard(metric, index, workspaceId) {
                const metricUrl = workspaceId && metric.id 
                    ? \`https://web.steep.app/\${workspaceId}/metrics/\${metric.id}\`
                    : null;
                
                // Helper function to safely convert to string and escape HTML
                function safeString(value) {
                    if (value === null || value === undefined) return '';
                    if (typeof value === 'object') {
                        // If it's an object, try to get a string representation
                        if (value.label) return String(value.label);
                        if (value.name) return String(value.name);
                        if (value.id) return String(value.id);
                        return '';
                    }
                    return String(value).replace(/</g, '&lt;').replace(/>/g, '&gt;');
                }
                
                // Helper to check if a value looks like an ID (starts with - or is just alphanumeric with dashes)
                function isIdLike(value) {
                    if (!value) return false;
                    const str = String(value);
                    // Check if it looks like an ID: starts with dash, or is very short alphanumeric
                    return /^-[A-Za-z0-9]+$/.test(str) || (str.length < 10 && /^[A-Za-z0-9_-]+$/.test(str));
                }
                
                const safeLabel = safeString(metric.label || metric.identifier || '');
                const safeIdentifier = safeString(metric.identifier);
                const safeDescription = safeString(metric.description);
                const safeOwner = safeString(metric.owner);
                const safeCategory = safeString(metric.category);
                
                // Only show category and owner if they're readable names (not IDs)
                const showCategory = safeCategory && !isIdLike(safeCategory);
                const showOwner = safeOwner && !isIdLike(safeOwner);
                
                // Show loading indicator for trend (will be replaced when data loads)
                // Use metric.id for ID (must match the ID used in lazy loading)
                const trendIndicatorId = metric.id ? \`trend-\${metric.id}\` : \`trend-index-\${index}\`;
                const trendIndicator = metric.id 
                    ? \`<div id="\${trendIndicatorId}" style="min-width: 400px; min-height: 120px; display: flex; align-items: center; justify-content: center;"><span class="trend-loading-dots"><span>.</span><span>.</span><span>.</span></span></div>\`
                    : '<div style="min-width: 400px; min-height: 120px; display: inline-block;"></div>';
                
                return \`
                    <div class="metric-card">
                        <div class="metric-card-header">
                            <div style="flex: 1;">
                                <div class="metric-card-title">\${safeLabel}</div>
                                <div class="metric-card-identifier">\${safeIdentifier}</div>
                                \${(showCategory || showOwner) ? \`
                                <div class="metric-card-meta">
                                    \${showCategory ? \`<div class="metric-meta-item"><span style="opacity: 0.6;">📁</span> <span>\${safeCategory}</span></div>\` : ''}
                                    \${showOwner ? \`<div class="metric-meta-item"><span style="opacity: 0.6;">👤</span> <span>\${safeOwner}</span></div>\` : ''}
                                </div>
                                \` : ''}
                            </div>
                            <div class="trend-container">
                                \${trendIndicator}
                            </div>
                            <div style="display: flex; align-items: center;">
                                \${metric.id ? \`<a href="\${metricUrl || '#'}" target="_blank" onclick="event.stopPropagation(); \${metricUrl ? '' : 'alert(\\'Please set Workspace ID in Configuration tab to view this metric\\'); return false;'}" style="color: #4a5568; text-decoration: none; font-size: 0.9em; padding: 8px 16px; border: 1.5px solid #e2e8f0; border-radius: 8px; background: #f7fafc; transition: all 0.2s; white-space: nowrap;" onmouseover="this.style.borderColor='#81e6d9'; this.style.background='#f0f9ff'" onmouseout="this.style.borderColor='#e2e8f0'; this.style.background='#f7fafc'">🔗 View</a>\` : ''}
                            </div>
                        </div>
                        \${safeDescription ? \`<div class="metric-card-description">\${safeDescription}</div>\` : ''}
                        \${!metric.id ? \`
                        <div style="margin-top: 12px; padding: 12px; background: #fff5e6; border-radius: 8px; font-size: 0.85em; color: #856404;">
                            ⚠️ No metric ID found. This metric may not be accessible via the API.
                        </div>
                        \` : ''}
                    </div>
                \`;
            }
            
            // Build HTML with collapsible category sections
            let html = '';
            const categoryNames = Object.keys(metricsByCategory).sort();
            
            // Sort categories: put "Uncategorized" at the end
            const sortedCategories = categoryNames.filter(cat => cat !== 'Uncategorized').sort();
            if (categoryNames.includes('Uncategorized')) {
                sortedCategories.push('Uncategorized');
            }
            
            // Render categorized metrics
            sortedCategories.forEach((categoryName, catIndex) => {
                const categoryMetrics = metricsByCategory[categoryName];
                const categoryId = 'category-' + catIndex;
                const isUncategorized = categoryName === 'Uncategorized';
                html += \`
                    <div style="margin-bottom: 24px;">
                        <div class="category-header" onclick="toggleCategory('\${categoryId}')" style="display: flex; align-items: center; justify-content: space-between; padding: 16px; background: #f7fafc; border: 1.5px solid #e2e8f0; border-radius: 12px; cursor: pointer; margin-bottom: 12px; transition: all 0.2s;" onmouseover="this.style.background='#edf2f7'; this.style.borderColor='#81e6d9'" onmouseout="this.style.background='#f7fafc'; this.style.borderColor='#e2e8f0'">
                            <div style="display: flex; align-items: center; gap: 8px;">
                                \${!isUncategorized ? '<span style="font-size: 1.2em;">📁</span>' : ''}
                                <span style="font-weight: 600; color: #2d3748; font-size: 1.1em;">\${categoryName}</span>
                                <span style="color: #718096; font-size: 0.9em;">(\${categoryMetrics.length})</span>
                            </div>
                            <span class="category-toggle" id="toggle-\${categoryId}" style="font-size: 1.2em; transition: transform 0.2s;">▼</span>
                        </div>
                        <div class="category-content" id="\${categoryId}" style="display: block;">
                            \${categoryMetrics.map(({ metric, index }) => renderMetricCard(metric, index, workspaceId)).join('')}
                        </div>
                    </div>
                \`;
            });
            
            catalogList.innerHTML = html;
            
            // Small delay to ensure DOM is ready, then check cache and load trends
            setTimeout(() => {
                // Now lazy load trend data for all metrics with IDs
                // Fetch trends in background and update each card as data arrives
                metrics.forEach((metric, index) => {
                    if (!metric.id || !apiKey) {
                        // If no metric ID, remove loading indicator
                        const trendIndicatorEl = document.getElementById(\`trend-\${metric.id || index}\`);
                        if (trendIndicatorEl) {
                            trendIndicatorEl.innerHTML = '<span style="width: 24px; display: inline-block;"></span>';
                        }
                        return;
                    }
                    
                    const trendIndicatorId = \`trend-\${metric.id}\`;
                    
                // Check cache first for immediate display
                const cachedTrend = getCachedTrend(metric.id);
                if (cachedTrend !== null) {
                    const trendIndicatorEl = document.getElementById(trendIndicatorId);
                    if (trendIndicatorEl) {
                        // Handle both old format (string) and new format (object)
                        let direction, dataPoints;
                        if (typeof cachedTrend === 'string') {
                            // Old format - just direction
                            direction = cachedTrend;
                            dataPoints = [];
                        } else {
                            // New format - object with direction and dataPoints
                            direction = cachedTrend.direction;
                            dataPoints = cachedTrend.dataPoints || [];
                        }
                        
                        const chart = dataPoints.length >= 2 ? createMiniTrendChart(dataPoints) : '';
                        trendIndicatorEl.innerHTML = '<div style="display: flex; align-items: center; justify-content: center;">' + chart + '</div>';
                    } else {
                        console.warn('Trend indicator element not found (cached):', trendIndicatorId, 'Metric:', metric.identifier);
                    }
                    return; // Skip API call if we have cached data
                }
                
                // Fetch trend data asynchronously (no cache or cache expired)
                fetchMetricTrending(metric.id, apiKey, apiBaseUrl)
                    .then(trendData => {
                        if (!trendData) return;
                        
                        const trendIndicatorEl = document.getElementById(trendIndicatorId);
                        if (trendIndicatorEl) {
                            const chart = createMiniTrendChart(trendData.dataPoints || []);
                            trendIndicatorEl.innerHTML = '<div style="display: flex; align-items: center; justify-content: center;">' + chart + '</div>';
                        } else {
                            console.warn('Trend indicator element not found for metric:', metric.id, 'ID:', trendIndicatorId);
                        }
                    })
                    .catch((error) => {
                        // On error, hide the loading indicator
                        const trendIndicatorEl = document.getElementById(trendIndicatorId);
                        if (trendIndicatorEl) {
                            trendIndicatorEl.innerHTML = '<span style="width: 24px; display: inline-block;"></span>';
                        }
                        console.error('Error fetching trend for metric', metric.identifier, error);
                    });
                });
            }, 100); // Small delay to ensure DOM is ready
        }
        
        function toggleCategory(categoryId) {
            const content = document.getElementById(categoryId);
            const toggle = document.getElementById('toggle-' + categoryId);
            if (content && toggle) {
                const isCollapsed = content.style.display === 'none';
                content.style.display = isCollapsed ? 'block' : 'none';
                toggle.style.transform = isCollapsed ? 'rotate(0deg)' : 'rotate(-90deg)';
            }
        }
        
        async function fetchMetricTrending(metricId, apiKey, apiBaseUrl) {
            if (!metricId || !apiKey) return null;
            
            // Check cache first
            const cachedTrend = getCachedTrend(metricId);
            if (cachedTrend !== null && cachedTrend.dataPoints) {
                return cachedTrend;
            }
            
            try {
                // Get last 7 days of data for mini chart
                const now = new Date();
                const toDate = new Date(now);
                toDate.setDate(toDate.getDate() - 1); // Yesterday
                toDate.setHours(23, 59, 59, 999);
                
                const fromDate = new Date(now);
                fromDate.setDate(fromDate.getDate() - 7); // 7 days ago
                fromDate.setHours(0, 0, 0, 0);
                
                const response = await fetch('/api/query-metric', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        api_key: apiKey,
                        api_base_url: apiBaseUrl,
                        metric_id: metricId,
                        time_grain: 'daily',
                        from_date: fromDate.toISOString(),
                        to_date: toDate.toISOString()
                    })
                });
                
                if (!response.ok) return null;
                
                const data = await response.json();
                let trendDirection = null;
                let dataPoints = [];
                
                if (data.success && data.data && data.data.length >= 2) {
                    // Sort by time to ensure correct order (oldest first)
                    const sortedData = [...data.data].sort((a, b) => 
                        new Date(a.time).getTime() - new Date(b.time).getTime()
                    );
                    
                    dataPoints = sortedData;
                    
                    // Get last two days to compare for arrow direction
                    const points = sortedData.map(point => point.metric || 0);
                    const previousDay = points[points.length - 2] || 0;
                    const currentDay = points[points.length - 1] || 0;
                    
                    // Calculate trend direction
                    if (previousDay === 0) {
                        trendDirection = currentDay > 0 ? 'up' : 'neutral';
                    } else if (currentDay > previousDay) {
                        trendDirection = 'up';
                    } else if (currentDay < previousDay) {
                        trendDirection = 'down';
                    } else {
                        trendDirection = 'neutral';
                    }
                } else if (data.success && data.data && data.data.length === 1) {
                    // If only one day of data, can't compare - return neutral
                    dataPoints = data.data;
                    trendDirection = 'neutral';
                }
                
                // Cache the result with both direction and data points
                if (trendDirection !== null) {
                    setCachedTrend(metricId, { direction: trendDirection, dataPoints: dataPoints });
                }
                
                return { direction: trendDirection, dataPoints: dataPoints };
            } catch (error) {
                console.error('Error fetching trend data:', error);
                return null;
            }
        }
        
        function generateTrendChart(dataPoints, width, height) {
            if (!dataPoints || dataPoints.length === 0) return '';
            
            const padding = 8;
            const chartWidth = width - padding * 2;
            const chartHeight = height - padding * 2;
            
            const values = dataPoints.map(d => d.value);
            const minValue = Math.min(...values);
            const maxValue = Math.max(...values);
            const range = maxValue - minValue || 1;
            
            const points = dataPoints.map((point, i) => {
                const x = padding + (i / (dataPoints.length - 1 || 1)) * chartWidth;
                const y = padding + chartHeight - ((point.value - minValue) / range) * chartHeight;
                return \`\${x},\${y}\`;
            }).join(' ');
            
            const areaPoints = points + \` \${padding + chartWidth},\${padding + chartHeight} \${padding},\${padding + chartHeight}\`;
            const gradientId = 'gradient-' + Math.random().toString(36).substr(2, 9);
            
            return \`
                <svg width="\${width}" height="\${height}" style="display: block;">
                    <defs>
                        <linearGradient id="\${gradientId}" x1="0%" y1="0%" x2="0%" y2="100%">
                            <stop offset="0%" style="stop-color:#81e6d9;stop-opacity:0.4" />
                            <stop offset="100%" style="stop-color:#81e6d9;stop-opacity:0.1" />
                        </linearGradient>
                    </defs>
                    <polyline points="\${areaPoints}" fill="url(#\${gradientId})" />
                    <polyline points="\${points}" class="trend-line" />
                </svg>
            \`;
        }
        
        function filterCatalogMetrics() {
            const searchTerm = document.getElementById('catalogMetricSearch').value.toLowerCase();
            const filtered = catalogMetrics.filter(metric => {
                const label = (metric.label || '').toLowerCase();
                const identifier = (metric.identifier || '').toLowerCase();
                const description = (metric.description || '').toLowerCase();
                return label.includes(searchTerm) || identifier.includes(searchTerm) || description.includes(searchTerm);
            });
            displayCatalogMetrics(filtered);
        }
        
        function switchTab(tabName) {
            // Hide all tabs
            document.querySelectorAll('.tab-content').forEach(tab => {
                tab.classList.remove('active');
            });
            
            // Remove active class from all nav links
            document.querySelectorAll('.nav-tab').forEach(link => {
                link.classList.remove('active');
            });
            
            // Show selected tab
            const selectedTab = document.getElementById(tabName + '-tab');
            if (selectedTab) {
                selectedTab.classList.add('active');
            }
            
            // Add active class to clicked nav link
            const clickedLink = document.querySelector(\`[data-tab="\${tabName}"]\`);
            if (clickedLink) {
                clickedLink.classList.add('active');
            }
            
            // Auto-load metrics if switching to catalog tab and API key is available
            if (tabName === 'catalog') {
                const apiKey = document.getElementById('apiKey').value.trim();
                const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
                // Update cache timestamp display
                updateCatalogCacheTimestamp(apiKey, apiBaseUrl);
                if (apiKey && catalogMetrics.length === 0) {
                    loadCatalogMetrics();
                }
            }
            
            // Auto-load dashboard if switching to dashboard tab
            if (tabName === 'dashboard') {
                refreshDashboard();
            }
        }
        
        function refreshDashboard() {
            const summaryEl = document.getElementById('dashboardSummary');
            const alertsEl = document.getElementById('dashboardAlerts');
            const cacheTimestampEl = document.getElementById('cacheTimestamp');
            
            // Load last alert results from localStorage
            let lastResults = null;
            let cacheTime = null;
            try {
                const stored = localStorage.getItem('steep_last_alert_results');
                if (stored) {
                    const parsed = JSON.parse(stored);
                    cacheTime = parsed.timestamp;
                    // Only use if less than 24 hours old
                    if (Date.now() - parsed.timestamp < 24 * 60 * 60 * 1000) {
                        lastResults = parsed.data;
                    }
                }
            } catch (e) {
                console.warn('Could not load alert results from localStorage:', e);
            }
            
            // Display cache timestamp
            if (cacheTimestampEl) {
                if (cacheTime) {
                    const cacheDate = new Date(cacheTime);
                    const age = Date.now() - cacheTime;
                    const ageHours = Math.floor(age / (60 * 60 * 1000));
                    const ageMinutes = Math.floor((age % (60 * 60 * 1000)) / (60 * 1000));
                    const isExpired = age >= 24 * 60 * 60 * 1000;
                    
                    let ageText = '';
                    if (ageHours > 0) {
                        ageText = \`\${ageHours}h \${ageMinutes}m ago\`;
                    } else {
                        ageText = \`\${ageMinutes}m ago\`;
                    }
                    
                    cacheTimestampEl.innerHTML = \`
                        <span style="color: \${isExpired ? '#f56565' : '#718096'};">📦 Cached: \${cacheDate.toLocaleTimeString()} (\${ageText})</span>
                    \`;
                } else {
                    cacheTimestampEl.innerHTML = '<span style="color: #a0aec0;">📦 No cached data</span>';
                }
            }
            
            // Load alerts from config
            let alerts = [];
            try {
                const alertItems = document.querySelectorAll('.alert-item');
                alertItems.forEach((item) => {
                    const id = item.id.replace('alert-', '');
                    const name = item.querySelector('[name="alert-name-' + id + '"]')?.value.trim();
                    if (name) {
                        alerts.push({ name });
                    }
                });
            } catch (e) {
                // If alerts aren't loaded yet, try to get from config
            }
            
            // Calculate summary stats
            let triggered = 0;
            let ok = 0;
            let errors = 0;
            let total = 0;
            
            if (lastResults && lastResults.results) {
                total = lastResults.results.length;
                lastResults.results.forEach(result => {
                    if (result.triggered) {
                        triggered++;
                    } else if (result.error) {
                        errors++;
                    } else {
                        ok++;
                    }
                });
            } else {
                // If no results, show config-based stats
                total = alerts.length;
            }
            
            // Render summary cards
            summaryEl.innerHTML = \`
                <div class="dashboard-card \${triggered > 0 ? 'triggered' : ''}">
                    <div class="dashboard-card-icon">🚨</div>
                    <div class="dashboard-card-value">\${triggered}</div>
                    <div class="dashboard-card-label">Triggered</div>
                </div>
                <div class="dashboard-card ok">
                    <div class="dashboard-card-icon">✅</div>
                    <div class="dashboard-card-value">\${ok}</div>
                    <div class="dashboard-card-label">OK</div>
                </div>
                <div class="dashboard-card">
                    <div class="dashboard-card-icon">📊</div>
                    <div class="dashboard-card-value">\${total}</div>
                    <div class="dashboard-card-label">Total Alerts</div>
                </div>
                \${errors > 0 ? \`
                <div class="dashboard-card" style="border-color: #f6ad55; background: #fffaf0;">
                    <div class="dashboard-card-icon">⚠️</div>
                    <div class="dashboard-card-value">\${errors}</div>
                    <div class="dashboard-card-label">Errors</div>
                </div>
                \` : ''}
            \`;
            
            // Render recent alert results
            if (lastResults && lastResults.results && lastResults.results.length > 0) {
                const timestamp = new Date(lastResults.timestamp);
                alertsEl.innerHTML = \`
                    <h2 style="margin: 0 0 24px 0; color: #2d3748; font-size: 1.1em; font-weight: 500;">Recent Alert Check</h2>
                    <div style="color: #718096; font-size: 0.9em; margin-bottom: 16px;">
                        Last checked: \${timestamp.toLocaleString()}
                    </div>
                    <div style="display: grid; gap: 16px;">
                        \${lastResults.results.map(result => {
                            const statusClass = result.triggered ? 'triggered' : 
                                              result.error ? 'error' : 'ok';
                            const statusIcon = result.triggered ? '🚨' : 
                                             result.error ? '⚠️' : '✅';
                            const statusText = result.triggered ? 'TRIGGERED' : 
                                             result.error ? 'ERROR' : 'OK';
                            
                            return \`
                                <div class="alert-card \${statusClass}">
                                    <div class="alert-header">
                                        <div>
                                            <div class="alert-name">\${statusIcon} \${result.alert?.name || 'Unknown Alert'}</div>
                                            <div style="font-size: 0.85em; color: #718096; margin-top: 4px;">
                                                Metric: \${result.alert?.metric_identifier || 'N/A'}
                                            </div>
                                        </div>
                                        <div class="alert-status \${statusClass}">
                                            \${statusText}
                                        </div>
                                    </div>
                                    \${result.metric_value !== null && result.metric_value !== undefined ? \`
                                    <div style="margin-top: 16px;">
                                        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                                            <span style="font-size: 0.9em; color: #718096;">Current Value:</span>
                                            <span style="font-size: 1.2em; font-weight: 600; color: #2d3748;">\${typeof result.metric_value === 'number' ? result.metric_value.toLocaleString() : result.metric_value}</span>
                                        </div>
                                        <div style="display: flex; justify-content: space-between; align-items: center;">
                                            <span style="font-size: 0.9em; color: #718096;">Threshold:</span>
                                            <span style="font-size: 1em; color: #718096;">\${typeof result.threshold === 'number' ? result.threshold.toLocaleString() : result.threshold}</span>
                                        </div>
                                    </div>
                                    \` : ''}
                                    \${result.error ? \`
                                    <div style="margin-top: 16px; padding: 12px; background: #fff5f5; border-radius: 8px; color: #c53030; font-size: 0.9em;">
                                        ❌ \${result.error}
                                    </div>
                                    \` : ''}
                                </div>
                            \`;
                        }).join('')}
                    </div>
                \`;
            } else {
                alertsEl.innerHTML = \`
                    <div style="text-align: center; padding: 40px; color: #718096;">
                        <div style="font-size: 2em; margin-bottom: 16px;">📊</div>
                        <div style="font-size: 1.1em; margin-bottom: 8px;">No alert results yet</div>
                        <div style="font-size: 0.9em;">Run an alert check from the Alerts tab to see results here</div>
                    </div>
                \`;
            }
        }
        
        async function saveApiConfig() {
            const apiKey = document.getElementById('apiKey').value.trim();
            const apiBaseUrl = document.getElementById('apiBaseUrl').value.trim() || 'https://api.steep.app';
            const workspaceId = document.getElementById('workspaceId').value.trim();
            
            if (!apiKey) {
                alert('❌ Please enter your Steep API key');
                return;
            }
            
            try {
                // Save API key
                await fetch('/api/save-api-key', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({ api_key: apiKey })
                });
                
                // Save workspace ID to config if provided
                if (workspaceId) {
                    // This will be saved when user saves alerts config
                }
                
                alert('✅ Configuration saved successfully!');
            } catch (error) {
                alert('❌ Error saving configuration: ' + (error.message || String(error)));
            }
        }
    </script>
</body>
</html>`;

// Handle loading API key from local file
async function handleLoadApiKey(): Promise<Response> {
  try {
    const apiKey = await Deno.readTextFile("alerts-prototype/.api-key");
    const trimmedKey = apiKey.trim();
    
    if (trimmedKey) {
      return new Response(
        JSON.stringify({
          success: true,
          api_key: trimmedKey,
        }),
        {
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    
    return new Response(
      JSON.stringify({
        success: false,
        error: "No API key found",
      }),
      {
        status: 404,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key file not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    throw error;
  }
}

// Handle saving API key to local file
async function handleSaveApiKey(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { api_key } = body;

    if (!api_key || !api_key.trim()) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await Deno.writeTextFile("alerts-prototype/.api-key", api_key.trim());

    return new Response(
      JSON.stringify({
        success: true,
        message: "API key saved successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle listing metrics from Steep API
async function handleListMetrics(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { api_key, api_base_url } = body;

    if (!api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = new SteepClient(api_key, api_base_url || "https://api.steep.app");
    const metrics = await client.listMetrics(true);

    return new Response(
      JSON.stringify({
        success: true,
        metrics: metrics,
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle querying a metric for trend data
async function handleQueryMetric(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { api_key, api_base_url, metric_id, time_grain, from_date, to_date } = body;

    if (!api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!metric_id) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Metric ID is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    const client = new SteepClient(api_key, api_base_url || "https://api.steep.app");
    
    const queryRequest = {
      timeGrain: time_grain || "daily",
      fromDate: from_date,
      toDate: to_date,
    };

    const result = await client.queryMetric(metric_id, queryRequest);

    return new Response(
      JSON.stringify({
        success: true,
        data: result.data || [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle loading config from YAML file
async function handleLoadConfig(): Promise<Response> {
  try {
    const configText = await Deno.readTextFile("alerts-prototype/config/alerts.yaml");
    const config = parseYaml(configText) as {
      steep: { api_base_url: string; workspace_id?: string };
      alerts: AlertConfig[];
    };

    return new Response(
      JSON.stringify({
        success: true,
        api_base_url: config.steep?.api_base_url || "https://api.steep.app",
        workspace_id: config.steep?.workspace_id || "",
        alerts: config.alerts || [],
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    if (error instanceof Deno.errors.NotFound) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "Config file not found",
        }),
        {
          status: 404,
          headers: { "Content-Type": "application/json" },
        }
      );
    }
    throw error;
  }
}

// Handle saving config to YAML file
async function handleSaveConfig(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { api_base_url, workspace_id, alerts } = body;

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "At least one alert is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Format alerts for YAML
    const yamlAlerts = alerts.map((alert: any) => ({
      name: alert.name,
      metric_identifier: alert.metric_identifier,
      threshold: alert.threshold,
      operator: alert.operator,
      time_period: alert.time_period || "daily",
      alert_to_emails: alert.alert_to_emails || [],
    }));

    // Create YAML structure
    const yamlConfig: any = {
      steep: {
        api_base_url: api_base_url || "https://api.steep.app",
      },
      alerts: yamlAlerts,
    };
    
    // Add workspace_id if provided
    if (workspace_id && workspace_id.trim()) {
      yamlConfig.steep.workspace_id = workspace_id.trim();
    }

    // Convert to YAML string
    const yamlString = stringifyYaml(yamlConfig);

    // Add header comment
    const finalYaml = `# Alert Configuration
# This file defines which metrics to monitor and when to alert
# Auto-generated by Steep Alerts GUI

${yamlString}`;

    // Write to file
    await Deno.writeTextFile("alerts-prototype/config/alerts.yaml", finalYaml);

    return new Response(
      JSON.stringify({
        success: true,
        message: "Configuration saved successfully",
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Handle API request to check alerts
async function handleCheckAlerts(request: Request): Promise<Response> {
  try {
    const body = await request.json();
    const { api_key, api_base_url, alerts } = body;

    if (!api_key) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "API key is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    if (!alerts || !Array.isArray(alerts) || alerts.length === 0) {
      return new Response(
        JSON.stringify({
          success: false,
          error: "At least one alert is required",
        }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    // Create client with provided API key
    const client = new SteepClient(api_key, api_base_url || "https://api.steep.app");

    // Get date based on first alert's time period (for display)
    const firstAlertPeriod = alerts[0]?.time_period || "daily";
    const { fromDate } = SteepClient.getDateRangeForPeriod(firstAlertPeriod);
    const queryDate = new Date(fromDate).toISOString().split("T")[0];

    // Check all alerts
    const results: AlertResult[] = [];
    for (const alertConfig of alerts) {
      const alert: AlertConfig = {
        name: alertConfig.name,
        metric_identifier: alertConfig.metric_identifier,
        threshold: alertConfig.threshold,
        operator: alertConfig.operator,
        time_period: alertConfig.time_period || "daily",
        alert_to_emails: alertConfig.alert_to_emails || [],
      };

      const result = await checkAlert(client, alert, queryDate);
      results.push(result);
    }

    return new Response(
      JSON.stringify({
        success: true,
        query_date: queryDate,
        results: results.map((r) => ({
          alert: {
            name: r.alert.name,
            metric_identifier: r.alert.metric_identifier,
            threshold: r.threshold,
            operator: r.alert.operator,
            time_period: r.alert.time_period || "daily",
            alert_to_emails: r.alert.alert_to_emails,
          },
          metric_value: r.metric_value,
          threshold: r.threshold,
          triggered: r.triggered,
          error: r.error,
          query_date: r.query_date,
        })),
      }),
      {
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (error) {
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : String(error),
      }),
      {
        status: 500,
        headers: { "Content-Type": "application/json" },
      }
    );
  }
}

// Main server function
async function startServer(port: number = 8000) {
  console.log(`🚀 Starting Steep Alerts GUI server...\n`);
  console.log(`✅ Server running at http://localhost:${port}`);
  
  // Try to open browser automatically (only once when server starts)
  // Wait a moment for server to be ready
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  try {
    const platform = Deno.build.os;
    const url = `http://localhost:${port}`;
    
    if (platform === "darwin") {
      // macOS
      const process = Deno.run({ cmd: ["open", url] });
      await process.status();
      process.close();
    } else if (platform === "windows") {
      // Windows
      const process = Deno.run({ cmd: ["cmd", "/c", "start", url] });
      await process.status();
      process.close();
    } else {
      // Linux
      const process = Deno.run({ cmd: ["xdg-open", url] });
      await process.status();
      process.close();
    }
    console.log(`🌐 Browser opened automatically!\n`);
  } catch (error) {
    // If auto-open fails, just show the message
    console.log(`📊 Open your browser and navigate to: http://localhost:${port}\n`);
  }
  
  console.log(`💡 No API key or config file needed - enter everything in the browser!\n`);
  console.log(`💡 Close the browser window to stop the server.\n`);

  // Start server
  const handler = async (request: Request): Promise<Response> => {
    const url = new URL(request.url);

    if (url.pathname === "/" || url.pathname === "/index.html") {
      return new Response(HTML_TEMPLATE, {
        headers: { "Content-Type": "text/html" },
      });
    }

    if (url.pathname === "/api/check-alerts" && request.method === "POST") {
      return await handleCheckAlerts(request);
    }

    if (url.pathname === "/api/load-config" && request.method === "GET") {
      return await handleLoadConfig();
    }

    if (url.pathname === "/api/save-config" && request.method === "POST") {
      return await handleSaveConfig(request);
    }

    if (url.pathname === "/api/load-api-key" && request.method === "GET") {
      return await handleLoadApiKey();
    }

    if (url.pathname === "/api/save-api-key" && request.method === "POST") {
      return await handleSaveApiKey(request);
    }

    if (url.pathname === "/api/list-metrics" && request.method === "POST") {
      return await handleListMetrics(request);
    }

    if (url.pathname === "/api/query-metric" && request.method === "POST") {
      return await handleQueryMetric(request);
    }

    if (url.pathname === "/api/shutdown" && request.method === "POST") {
      console.log(`\n👋 Browser closed. Shutting down server...\n`);
      // Give a moment for the response to be sent
      setTimeout(() => {
        Deno.exit(0);
      }, 100);
      return new Response("OK", { status: 200 });
    }

    // Serve logo
    if (url.pathname === "/assets/steep-logo.svg") {
      try {
        const logo = await Deno.readTextFile("alerts-prototype/assets/steep-logo.svg");
        return new Response(logo, {
          headers: { "Content-Type": "image/svg+xml" },
        });
      } catch {
        return new Response("Not Found", { status: 404 });
      }
    }

    return new Response("Not Found", { status: 404 });
  };

  const server = Deno.serve({ port }, handler);
  
  // Handle Ctrl+C gracefully
  Deno.addSignalListener("SIGINT", () => {
    console.log(`\n👋 Shutting down server...\n`);
    server.shutdown();
    Deno.exit(0);
  });
  
  await server.finished;
}

// Run if executed directly
if (import.meta.main) {
  const port = parseInt(Deno.env.get("PORT") || "8000");
  startServer(port).catch((error) => {
    console.error("❌ Fatal error:", error);
    Deno.exit(1);
  });
}
