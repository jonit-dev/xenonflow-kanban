import Database from 'better-sqlite3';
import { Service } from 'typedi';
import path from 'path';
import fs from 'fs';

// ABSOLUTE path - never depends on cwd
const DB_DIR = '/home/joao/projects/xenonflow-kanban/server/data';
const DB_PATH = path.join(DB_DIR, 'xenonflow.db');

@Service()
export class DatabaseClient {
  private db: Database.Database;
  private checkpointInterval: NodeJS.Timeout | null = null;

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    console.log(`[DB] Using database at: ${DB_PATH}`);
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
    
    // Periodic WAL checkpoint every 5 minutes to prevent data loss
    this.checkpointInterval = setInterval(() => {
      try {
        this.db.pragma('wal_checkpoint(PASSIVE)');
        console.log('[DB] Periodic WAL checkpoint complete');
      } catch (err) {
        console.error('[DB] Periodic checkpoint failed:', err);
      }
    }, 5 * 60 * 1000);
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    // Clear the checkpoint interval
    if (this.checkpointInterval) {
      clearInterval(this.checkpointInterval);
      this.checkpointInterval = null;
    }
    
    // Checkpoint WAL to ensure all data is written to main DB file
    try {
      this.db.pragma('wal_checkpoint(TRUNCATE)');
      console.log('[DB] WAL checkpoint complete before close');
    } catch (err) {
      console.error('[DB] WAL checkpoint failed:', err);
    }
    this.db.close();
    console.log('[DB] Database closed');
  }

  runMigrations(): void {
    // Create migrations tracking table if it doesn't exist
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS _migrations (
        name TEXT PRIMARY KEY,
        applied_at INTEGER DEFAULT (strftime('%s', 'now'))
      )
    `);

    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    // Get already applied migrations
    const applied = new Set(
      this.db.prepare('SELECT name FROM _migrations').all().map((r: any) => r.name)
    );

    for (const file of migrationFiles) {
      if (applied.has(file)) {
        console.log(`Skipping already applied migration: ${file}`);
        continue;
      }

      const migrationPath = path.join(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      this.db.exec(migration);
      this.db.prepare('INSERT INTO _migrations (name) VALUES (?)').run(file);
      console.log(`Applied migration: ${file}`);
    }
  }
}
