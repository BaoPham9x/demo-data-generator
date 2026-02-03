-- BigQuery View Creation Script
-- Run these commands in BigQuery to create all star schema views
-- Replace 'steep-demo.steep_demo_fintech' with your actual project and dataset

-- Step 1: Create dimension views
-- Run each CREATE OR REPLACE VIEW statement below

-- Dim Date
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_date` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from dim_date.sql

-- Dim Customer  
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_customer` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from dim_customer.sql

-- Dim Account
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_account` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from dim_account.sql

-- Dim Merchant
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_merchant` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from dim_merchant.sql

-- Dim Risk Event Type
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.dim_risk_event_type` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from dim_risk_event_type.sql

-- Step 2: Create fact views (after dimensions exist)
-- Fact Ad Spend
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_ad_spend` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_ad_spend.sql

-- Fact Visitors
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_visitors` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_visitors.sql

-- Fact Transactions
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_transactions` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_transactions.sql

-- Fact Customer Features
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_customer_features` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_customer_features.sql

-- Fact Subscriptions
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_subscriptions` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_subscriptions.sql

-- Fact Risk Events
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_risk_events` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_risk_events.sql

-- Fact Balances
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_balances` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_balances.sql

-- Fact Campaign ROI (optional - joins ad_spend + visitors)
CREATE OR REPLACE VIEW `steep-demo.steep_demo_fintech.fact_campaign_roi` AS
SELECT * FROM (SELECT 1) WHERE FALSE; -- Replace with actual SQL from fact_campaign_roi.sql

