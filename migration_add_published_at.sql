-- Migration: Add published_at field to decks table
-- This script adds the published_at column and populates it for existing published decks

-- Step 1: Add published_at column if it doesn't exist
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'decks' AND column_name = 'published_at'
    ) THEN
        ALTER TABLE decks ADD COLUMN published_at TIMESTAMP WITH TIME ZONE;
        RAISE NOTICE 'Column published_at added to decks table';
    ELSE
        RAISE NOTICE 'Column published_at already exists in decks table';
    END IF;
END $$;

-- Step 2: Populate published_at for existing published decks
-- Set published_at = created_at for decks that are currently shared
UPDATE decks
SET published_at = created_at
WHERE is_shared = true AND published_at IS NULL;

-- Step 3: Add index for better performance (optional but recommended)
CREATE INDEX IF NOT EXISTS idx_decks_published_at ON decks(published_at DESC) WHERE published_at IS NOT NULL;

-- Step 4: Add index for compound sorting (published_at, created_at)
CREATE INDEX IF NOT EXISTS idx_decks_published_created_sort ON decks(published_at DESC NULLS LAST, created_at DESC) WHERE is_shared = true;

-- Verification query to check results
SELECT
    COUNT(*) as total_decks,
    COUNT(CASE WHEN is_shared = true THEN 1 END) as published_decks,
    COUNT(CASE WHEN published_at IS NOT NULL THEN 1 END) as decks_with_published_at
FROM decks;