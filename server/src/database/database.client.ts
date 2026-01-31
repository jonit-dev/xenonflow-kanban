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

  constructor() {
    if (!fs.existsSync(DB_DIR)) {
      fs.mkdirSync(DB_DIR, { recursive: true });
    }

    console.log(`[DB] Using database at: ${DB_PATH}`);
    this.db = new Database(DB_PATH);
    this.db.pragma('journal_mode = WAL');
    this.db.pragma('foreign_keys = ON');
  }

  getDatabase(): Database.Database {
    return this.db;
  }

  close(): void {
    this.db.close();
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
