-- Rename priority → impact and story_points → effort
-- This migration renames columns to better reflect the "effort x impact" concept

-- Rename the columns
ALTER TABLE tickets RENAME COLUMN priority TO impact;
ALTER TABLE tickets RENAME COLUMN story_points TO effort;

-- Update the CHECK constraint for impact (same values as before)
-- Note: SQLite doesn't support ALTER CONSTRAINT, so we need to recreate the table
-- For now, the constraint will remain but with the new column name

-- Create a new table with the updated constraint
CREATE TABLE IF NOT EXISTS tickets_new (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  epic_id TEXT REFERENCES epics(id) ON DELETE SET NULL,
  assignee_id TEXT REFERENCES users(id) ON DELETE SET NULL,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL CHECK(status IN ('BACKLOG','TODO','IN_PROGRESS','REVIEW','DONE')),
  impact TEXT NOT NULL CHECK(impact IN ('low','medium','high','critical')),
  effort INTEGER DEFAULT 0,
  start_date TEXT,
  end_date TEXT,
  ai_insights TEXT,
  position INTEGER DEFAULT 0,
  flagged INTEGER DEFAULT 0,
  requires_human INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

-- Copy data from old table to new table
INSERT INTO tickets_new (id, project_id, epic_id, assignee_id, title, description, status, impact, effort, start_date, end_date, ai_insights, position, flagged, requires_human, created_at, updated_at)
SELECT id, project_id, epic_id, assignee_id, title, description, status, priority, story_points, start_date, end_date, ai_insights, position, flagged, requires_human, created_at, updated_at
FROM tickets;

-- Drop old table and rename the new one
DROP TABLE tickets;
ALTER TABLE tickets_new RENAME TO tickets;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_epic ON tickets(epic_id);
