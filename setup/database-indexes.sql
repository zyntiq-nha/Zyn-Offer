-- Database Optimization for Maximum Free Tier Performance
-- Run these commands in your Supabase SQL Editor to improve query performance

-- Index on created_at for faster date-based queries (month/year grouping)
CREATE INDEX IF NOT EXISTS idx_users_created_at ON users(created_at DESC);

-- Index on status for faster filtering
CREATE INDEX IF NOT EXISTS idx_users_status ON users(status);

-- Index on email for faster search
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Composite index for common query patterns (status + created_at)
CREATE INDEX IF NOT EXISTS idx_users_status_created ON users(status, created_at DESC);

-- Analyze tables to update statistics for query planner
ANALYZE users;
ANALYZE roles;
ANALYZE tenures;

-- Optional: Enable auto-vacuum for better space management
-- This helps reclaim space from deleted records
ALTER TABLE users SET (autovacuum_enabled = true);
ALTER TABLE roles SET (autovacuum_enabled = true);
ALTER TABLE tenures SET (autovacuum_enabled = true);
