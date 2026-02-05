# Steep Metric Alerts Prototype

Web-based alert system for monitoring Steep metrics with a beautiful GUI.

## 🚀 Quick Start

```bash
# Launch the web interface
deno task alerts-gui
```

Then open `http://localhost:8000` in your browser.

## ✨ Features

- **Dashboard** - Overview of alert status and recent results
- **Alerts Tab** - Configure and run metric alerts
- **Metric Catalog** - Browse all metrics with 7-day trend charts
- **Configuration** - Manage API key and workspace settings
- **Caching** - 24-hour cache for faster loading

## 🔑 Setup

1. **API Key**: Enter in the Configuration tab (or save to `alerts-prototype/.api-key`)
2. **Workspace ID**: Optional, for direct metric links
3. **Configure Alerts**: Use the Alerts tab to add metric thresholds

## 📊 What It Does

- Queries Steep API for metric values (daily/weekly/monthly)
- Compares against configurable thresholds
- Shows results in Dashboard with summary cards
- Displays mini trend charts (7 days) in Metric Catalog
- Caches data for 24 hours for performance

## 🎨 GUI Tabs

- **Dashboard** - Run alerts and view summary
- **Alerts** - Configure metric thresholds
- **Metric Catalog** - Browse metrics with trend visualization
- **Configuration** - API key and workspace settings

That's it! Everything is in the browser - no command line needed.
