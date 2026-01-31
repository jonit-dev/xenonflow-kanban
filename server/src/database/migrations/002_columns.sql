-- Columns table
CREATE TABLE IF NOT EXISTS columns (
  id TEXT PRIMARY KEY,
  project_id TEXT NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  status_key TEXT NOT NULL,
  position INTEGER DEFAULT 0,
  created_at INTEGER DEFAULT (strftime('%s', 'now')),
  updated_at INTEGER DEFAULT (strftime('%s', 'now'))
);

CREATE INDEX IF NOT EXISTS idx_columns_project ON columns(project_id);

-- Initialize default columns for existing projects
-- Using status_key as BACKLOG, TODO, IN_PROGRESS, REVIEW, DONE to match TicketStatus enum
-- But title will be what shows up in the board.
-- The user requested: rename Archived to "Done"
-- Based on App.tsx, DONE id was mapped to 'ARCHIVED' title.
-- We will now make it 'Done'.

INSERT INTO columns (id, project_id, title, status_key, position, created_at, updated_at)
SELECT 
  'col_todo_' || id, 
  id, 
  'PENDING', 
  'TODO', 
  0,
  strftime('%s', 'now'),
  strftime('%s', 'now')
FROM projects
WHERE NOT EXISTS (SELECT 1 FROM columns WHERE project_id = projects.id AND status_key = 'TODO');

INSERT INTO columns (id, project_id, title, status_key, position, created_at, updated_at)
SELECT 
  'col_progress_' || id, 
  id, 
  'ACTIVE', 
  'IN_PROGRESS', 
  1,
  strftime('%s', 'now'),
  strftime('%s', 'now')
FROM projects
WHERE NOT EXISTS (SELECT 1 FROM columns WHERE project_id = projects.id AND status_key = 'IN_PROGRESS');

INSERT INTO columns (id, project_id, title, status_key, position, created_at, updated_at)
SELECT 
  'col_review_' || id, 
  id, 
  'ANALYSIS', 
  'REVIEW', 
  2,
  strftime('%s', 'now'),
  strftime('%s', 'now')
FROM projects
WHERE NOT EXISTS (SELECT 1 FROM columns WHERE project_id = projects.id AND status_key = 'REVIEW');

INSERT INTO columns (id, project_id, title, status_key, position, created_at, updated_at)
SELECT 
  'col_done_' || id, 
  id, 
  'Done', 
  'DONE', 
  3,
  strftime('%s', 'now'),
  strftime('%s', 'now')
FROM projects
WHERE NOT EXISTS (SELECT 1 FROM columns WHERE project_id = projects.id AND status_key = 'DONE');
