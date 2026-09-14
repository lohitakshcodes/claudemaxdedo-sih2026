-- =============================================================================
-- SMART INDIA HACKATHON 2026: POSTGRESQL + POSTGIS + PGVECTOR MIGRATION DDL
-- Project: Team ClaudeMaxDedo (WeatherGPT SIH26068 & KrishiSmriti SIH26193)
-- =============================================================================

-- 1. Enable Core PostgreSQL Extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS vector;

-- =============================================================================
-- WEATHERGPT SCHEMA: CAP_Alerts (Common Alerting Protocol + PostGIS)
-- =============================================================================

CREATE TABLE IF NOT EXISTS "CAP_Alerts" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "identifier" VARCHAR(255) NOT NULL UNIQUE,
    "sender" VARCHAR(255) NOT NULL,
    "sentAt" TIMESTAMPTZ(6) NOT NULL,
    "status" VARCHAR(32) NOT NULL DEFAULT 'Actual',
    "msgType" VARCHAR(32) NOT NULL DEFAULT 'Alert',
    "scope" VARCHAR(32) NOT NULL DEFAULT 'Public',
    "event" VARCHAR(128) NOT NULL,
    "urgency" VARCHAR(32) NOT NULL,
    "severity" VARCHAR(32) NOT NULL,
    "certainty" VARCHAR(32) NOT NULL,
    "headline" VARCHAR(512) NOT NULL,
    "description" TEXT NOT NULL,
    "instruction" TEXT,
    "areaDesc" VARCHAR(512) NOT NULL,
    "geom" geometry(Polygon, 4326) NOT NULL,
    "minAltitudeM" DOUBLE PRECISION DEFAULT 0.0,
    "maxAltitudeM" DOUBLE PRECISION DEFAULT 12000.0,
    "effectiveAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "expiresAt" TIMESTAMPTZ(6) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- Spatial GIST Index for Sub-Millisecond Point-in-Polygon (ST_Contains) Checks
CREATE INDEX IF NOT EXISTS "idx_cap_alerts_geom_gist" 
    ON "CAP_Alerts" USING GIST ("geom");

-- Filtering Indexes
CREATE INDEX IF NOT EXISTS "idx_cap_alerts_event" ON "CAP_Alerts" ("event");
CREATE INDEX IF NOT EXISTS "idx_cap_alerts_severity" ON "CAP_Alerts" ("severity");
CREATE INDEX IF NOT EXISTS "idx_cap_alerts_expires_at" ON "CAP_Alerts" ("expiresAt");


-- =============================================================================
-- KRISHISMRITI SCHEMA: Farm_Plots, Plot_Memory (pgvector), Panchayat_IoT
-- =============================================================================

-- 1. Farm_Plots: Geospatial registry of farmer land parcels
CREATE TABLE IF NOT EXISTS "Farm_Plots" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "farmerId" VARCHAR(64) NOT NULL,
    "farmerName" VARCHAR(255) NOT NULL,
    "phoneNumber" VARCHAR(20),
    "language" VARCHAR(16) NOT NULL DEFAULT 'bho',
    "village" VARCHAR(128) NOT NULL,
    "district" VARCHAR(128) NOT NULL,
    "state" VARCHAR(128) NOT NULL,
    "cropType" VARCHAR(128) NOT NULL,
    "sowingDate" DATE,
    "soilType" VARCHAR(64),
    "areaAcres" DOUBLE PRECISION NOT NULL DEFAULT 1.0,
    "geom" geometry(Polygon, 4326) NOT NULL,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS "idx_farm_plots_geom_gist" 
    ON "Farm_Plots" USING GIST ("geom");
CREATE INDEX IF NOT EXISTS "idx_farm_plots_farmer_id" ON "Farm_Plots" ("farmerId");
CREATE INDEX IF NOT EXISTS "idx_farm_plots_location" ON "Farm_Plots" ("village", "district");

-- 2. Plot_Memory: Episodic farm log memory with 1536-dimensional embeddings
CREATE TABLE IF NOT EXISTS "Plot_Memory" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "plotId" UUID NOT NULL REFERENCES "Farm_Plots"("id") ON DELETE CASCADE,
    "farmerId" VARCHAR(64) NOT NULL,
    "logText" TEXT NOT NULL,
    "logEnglish" TEXT,
    "category" VARCHAR(64) NOT NULL, -- FERTILIZER, IRRIGATION, PESTICIDE, SOWING, HARVEST
    "embedding" vector(1536) NOT NULL,
    "metadata" JSONB,
    "timestamp" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "createdAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- HNSW Vector Cosine Index for ultra-fast RAG similarity retrieval
CREATE INDEX IF NOT EXISTS "idx_plot_memory_embedding_hnsw" 
    ON "Plot_Memory" USING hnsw ("embedding" vector_cosine_ops)
    WITH (m = 16, ef_construction = 64);

CREATE INDEX IF NOT EXISTS "idx_plot_memory_farmer_plot" ON "Plot_Memory" ("farmerId", "plotId");
CREATE INDEX IF NOT EXISTS "idx_plot_memory_category" ON "Plot_Memory" ("category");
CREATE INDEX IF NOT EXISTS "idx_plot_memory_timestamp" ON "Plot_Memory" ("timestamp" DESC);

-- 3. Panchayat_IoT: Live micro-climate sensor stream from village telemetry units
CREATE TABLE IF NOT EXISTS "Panchayat_IoT" (
    "id" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    "sensorId" VARCHAR(64) NOT NULL,
    "village" VARCHAR(128) NOT NULL,
    "district" VARCHAR(128) NOT NULL,
    "state" VARCHAR(128) NOT NULL,
    "soilMoisturePercent" DOUBLE PRECISION NOT NULL,
    "soilTemperatureCelsius" DOUBLE PRECISION NOT NULL,
    "ambientTempCelsius" DOUBLE PRECISION NOT NULL,
    "ambientHumidityPercent" DOUBLE PRECISION NOT NULL,
    "rainfallLast24hMm" DOUBLE PRECISION NOT NULL DEFAULT 0.0,
    "leafWetnessIndex" DOUBLE PRECISION DEFAULT 0.0,
    "batteryLevel" DOUBLE PRECISION NOT NULL DEFAULT 98.0,
    "recordedAt" TIMESTAMPTZ(6) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "rawPayload" JSONB
);

CREATE INDEX IF NOT EXISTS "idx_panchayat_iot_village" ON "Panchayat_IoT" ("village", "district");
CREATE INDEX IF NOT EXISTS "idx_panchayat_iot_sensor" ON "Panchayat_IoT" ("sensorId");
CREATE INDEX IF NOT EXISTS "idx_panchayat_iot_recorded_at" ON "Panchayat_IoT" ("recordedAt" DESC);

-- =============================================================================
-- SAMPLE CANONICAL SEED DATA (For Evaluator Demonstration & Validation)
-- =============================================================================

-- Seed 1: Active IMD Severe Squall Alert Polygon over Varanasi/Chandauli Agricultural Belt
INSERT INTO "CAP_Alerts" (
    "identifier", "sender", "sentAt", "status", "msgType", "scope",
    "event", "urgency", "severity", "certainty", "headline", "description",
    "instruction", "areaDesc", "geom", "expiresAt"
) VALUES (
    'URN:IN-MD:DISASTER:2026:VAR-089',
    'dwr.varanasi@imd.gov.in',
    NOW(),
    'Actual',
    'Alert',
    'Public',
    'Severe Squall / Cloudburst Hazard',
    'Immediate',
    'Severe',
    'Observed',
    'S-Band Doppler Radar Alert: 65 km/h squall and intense convective downburst imminent in Varanasi-Chandauli agro-corridor.',
    'Doppler Radar Reflectivity dBZ > 54 observed at 3.2km altitude heading southeast. Heavy squall with 42mm localized precipitation expected between 15:30 and 18:00 IST.',
    'Cease all pesticide/fertilizer spraying immediately. Protect harvested grain in covered warehouses. Tether livestock in elevated sheds.',
    'Varanasi - Chandauli - Ghazipur Agro-Climatic Zone',
    ST_GeomFromText('POLYGON((82.80 25.20, 83.20 25.20, 83.20 25.50, 82.80 25.50, 82.80 25.20))', 4326),
    NOW() + INTERVAL '12 hours'
) ON CONFLICT ("identifier") DO NOTHING;

-- Seed 2: Farmer Profile & Plot Polygon for Ramu Kisan (Barabanki / Chandauli)
INSERT INTO "Farm_Plots" (
    "id", "farmerId", "farmerName", "phoneNumber", "language",
    "village", "district", "state", "cropType", "sowingDate", "soilType", "areaAcres", "geom"
) VALUES (
    'a0eebc99-9c0b-4ef8-bb6d-6bb9bd380a11',
    'FARMER-UP-BRB-1049',
    'Ramu Yadav (रामू यादव)',
    '+919876543210',
    'bho',
    'Fatehpur',
    'Barabanki',
    'Uttar Pradesh',
    'Wheat (PBW-502)',
    '2025-11-15',
    'Alluvial Loamy',
    2.5,
    ST_GeomFromText('POLYGON((82.95 25.28, 82.97 25.28, 82.97 25.30, 82.95 25.30, 82.95 25.28))', 4326)
) ON CONFLICT DO NOTHING;

-- Seed 3: Panchayat IoT Telemetry (Simulated village soil & weather station)
INSERT INTO "Panchayat_IoT" (
    "sensorId", "village", "district", "state",
    "soilMoisturePercent", "soilTemperatureCelsius", "ambientTempCelsius",
    "ambientHumidityPercent", "rainfallLast24hMm", "leafWetnessIndex", "batteryLevel", "recordedAt"
) VALUES (
    'IOT-GP-UP-BRB-04',
    'Fatehpur',
    'Barabanki',
    'Uttar Pradesh',
    38.4,
    21.2,
    29.5,
    74.0,
    14.5,
    4.2,
    98.5,
    NOW()
);
