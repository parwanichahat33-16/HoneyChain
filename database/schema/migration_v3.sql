-- HoneyChain migration: Batch 3 additions
-- Run this once against your existing database (it only adds new things,
-- it does not touch or delete any existing data):
--
--   psql -U postgres -d honeychain -f database/schema/migration_v3.sql

-- Consumer feedback on honey batches
CREATE TABLE IF NOT EXISTS feedback (
    id SERIAL PRIMARY KEY,
    batch_id VARCHAR(50) NOT NULL REFERENCES batches(batch_id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating BETWEEN 1 AND 5),
    comment TEXT,
    created_at TIMESTAMP DEFAULT NOW()
);
CREATE INDEX IF NOT EXISTS idx_feedback_batch ON feedback(batch_id);

-- Track which simulated notification channels an alert was "sent" through
ALTER TABLE alerts ADD COLUMN IF NOT EXISTS notified_channels TEXT[] DEFAULT '{}';
