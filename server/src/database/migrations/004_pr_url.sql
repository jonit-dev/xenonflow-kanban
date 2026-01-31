-- Add pr_url field to tickets for linking GitHub PRs
ALTER TABLE tickets ADD COLUMN pr_url TEXT;
