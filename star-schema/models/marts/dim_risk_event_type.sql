-- Dimension: Risk Event Type
SELECT DISTINCT
    event_type as risk_event_type_key,
    event_type,
    CASE 
        WHEN event_type IN ('fraud_alert', 'aml_flag') THEN 'critical'
        WHEN event_type IN ('suspicious_activity', 'amount_threshold') THEN 'high'
        WHEN event_type IN ('velocity_check', 'geographic_anomaly') THEN 'medium'
        ELSE 'low'
    END as default_severity
FROM {{ source('raw', 'raw_risk_events') }}
