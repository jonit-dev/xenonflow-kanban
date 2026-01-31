-- Rename priority → impact and story_points → effort
-- This migration renames columns to better reflect the "effort x impact" concept
-- FIXED: Made idempotent - checks if columns exist before operating

-- Only proceed if the old column names still exist
-- If 'impact' column already exists, this migration was already applied correctly
SELECT CASE 
  WHEN EXISTS (SELECT 1 FROM pragma_table_info('tickets') WHERE name = 'impact') 
  THEN RAISE(IGNORE) 
END;

-- If we get here, need to do the migration
-- Check if we're in a partially-migrated state (tickets_new exists)
DROP TABLE IF EXISTS tickets_new;

-- Create the new table with correct schema
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

-- Copy data - use old column names (priority, story_points) since they haven't been renamed yet
INSERT INTO tickets_new (id, project_id, epic_id, assignee_id, title, description, status, impact, effort, start_date, end_date, ai_insights, position, flagged, requires_human, created_at, updated_at)
SELECT id, project_id, epic_id, assignee_id, title, description, status, 
       COALESCE(priority, 'medium'),  -- Handle null
       COALESCE(story_points, 0),     -- Handle null  
       start_date, end_date, ai_insights, position, 
       COALESCE(flagged, 0), 
       COALESCE(requires_human, 0), 
       created_at, updated_at
FROM tickets;

-- Drop old table and rename the new one
DROP TABLE tickets;
ALTER TABLE tickets_new RENAME TO tickets;

-- Recreate indexes
CREATE INDEX IF NOT EXISTS idx_tickets_project ON tickets(project_id);
CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
CREATE INDEX IF NOT EXISTS idx_tickets_epic ON tickets(epic_id);
