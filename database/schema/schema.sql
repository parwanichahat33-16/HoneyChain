-- HoneyChain Database Schema (PostgreSQL)

CREATE TYPE user_role AS ENUM ('beekeeper', 'admin');
CREATE TYPE hive_status AS ENUM ('healthy', 'medium_risk', 'high_risk');
CREATE TYPE batch_status AS ENUM ('harvested', 'extracted', 'processed', 'packaged', 'distributed');
CREATE TYPE health_status AS ENUM ('healthy', 'medium_risk', 'high_risk');

CREATE TABLE users (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    email VARCHAR(255) UNIQUE NOT NULL,
    password VARCHAR(255) NOT NULL, -- bcrypt hash
    role user_role NOT NULL DEFAULT 'beekeeper',
    phone VARCHAR(20),
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE apiaries (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255) NOT NULL,
    location VARCHAR(255) NOT NULL,
    cluster VARCHAR(100), -- e.g. Ahmedabad, Rajkot
    latitude DECIMAL(9,6),
    longitude DECIMAL(9,6),
    beekeeper_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE hives (
    id SERIAL PRIMARY KEY,
    hive_number VARCHAR(50) UNIQUE NOT NULL, -- e.g. H001
    apiary_id INTEGER NOT NULL REFERENCES apiaries(id) ON DELETE CASCADE,
    installation_date DATE NOT NULL,
    status hive_status DEFAULT 'healthy',
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE sensor_data (
    id SERIAL PRIMARY KEY,
    hive_id INTEGER NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    temperature DECIMAL(5,2) NOT NULL,   -- Celsius
    humidity DECIMAL(5,2) NOT NULL,      -- %
    weight DECIMAL(6,2) NOT NULL,        -- kg
    acoustic_level DECIMAL(5,2) NOT NULL,-- 0-100
    colony_strength DECIMAL(5,2) NOT NULL, -- 0-100
    is_simulated BOOLEAN DEFAULT TRUE,
    timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_sensor_data_hive_time ON sensor_data(hive_id, timestamp DESC);

CREATE TABLE predictions (
    id SERIAL PRIMARY KEY,
    hive_id INTEGER NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    disease_risk DECIMAL(5,2) NOT NULL,  -- 0-100
    health_status health_status NOT NULL,
    predicted_yield DECIMAL(6,2),        -- kg
    recommendation TEXT,
    timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_predictions_hive_time ON predictions(hive_id, timestamp DESC);

CREATE TABLE batches (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) UNIQUE NOT NULL, -- e.g. HC-2026-AHM-0001
    hive_id INTEGER NOT NULL REFERENCES hives(id),
    beekeeper_id INTEGER NOT NULL REFERENCES users(id),
    harvest_date DATE NOT NULL,
    quantity DECIMAL(6,2) NOT NULL, -- kg
    honey_type VARCHAR(100),
    location VARCHAR(255),
    status batch_status DEFAULT 'harvested',
    blockchain_hash VARCHAR(255),
    qr_code TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE traceability_events (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    event_type VARCHAR(50) NOT NULL, -- HARVESTED, EXTRACTED, PROCESSED, PACKAGED, DISTRIBUTED
    location VARCHAR(255),
    notes TEXT,
    blockchain_tx VARCHAR(255),
    timestamp TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_traceability_batch ON traceability_events(batch_id, timestamp);

CREATE TABLE alerts (
    id SERIAL PRIMARY KEY,
    hive_id INTEGER NOT NULL REFERENCES hives(id) ON DELETE CASCADE,
    severity VARCHAR(20) NOT NULL, -- low, medium, high
    message TEXT NOT NULL,
    recommendation TEXT,
    is_resolved BOOLEAN DEFAULT FALSE,
    notified_channels TEXT[] DEFAULT '{}', -- e.g. {'email','whatsapp'} — simulated, no real sends
    created_at TIMESTAMP DEFAULT NOW()
);

CREATE TABLE feedback (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX idx_feedback_batch ON feedback(batch_id);
