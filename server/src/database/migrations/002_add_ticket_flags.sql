-- Add flagged and requires_human columns to tickets
ALTER TABLE tickets ADD COLUMN flagged INTEGER DEFAULT 0;
ALTER TABLE tickets ADD COLUMN requires_human INTEGER DEFAULT 0;

-- Index for flagged tickets (quick lookup)
CREATE INDEX IF NOT EXISTS idx_tickets_flagged ON tickets(flagged) WHERE flagged = 1;
CREATE INDEX IF NOT EXISTS idx_tickets_requires_human ON tickets(requires_human) WHERE requires_human = 1;
