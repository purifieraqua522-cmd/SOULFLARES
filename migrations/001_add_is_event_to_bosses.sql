-- Migration: Add is_event column to bosses table
-- This migration adds support for event-specific bosses

-- Add is_event column if it doesn't already exist
ALTER TABLE bosses 
ADD COLUMN IF NOT EXISTS is_event boolean NOT NULL DEFAULT false;

-- Update the boss data with event bosses (if needed, run the seed script after this)
-- Note: This migration just adds the column. New event boss data will be added via seed script.

COMMIT;
