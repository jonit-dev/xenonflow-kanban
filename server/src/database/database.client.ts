import Database from 'better-sqlite3';
import { Service } from 'typedi';
import path from 'path';
import fs from 'fs';

@Service()
export class DatabaseClient {
  private db: Database.Database;

  constructor() {
    const dbDir = path.join(process.cwd(), 'data');
    if (!fs.existsSync(dbDir)) {
      fs.mkdirSync(dbDir, { recursive: true });
    }

    const dbPath = path.join(dbDir, 'xenonflow.db');
    this.db = new Database(dbPath);
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
    const migrationsDir = path.join(__dirname, 'migrations');
    const migrationFiles = fs.readdirSync(migrationsDir)
      .filter(f => f.endsWith('.sql'))
      .sort();

    for (const file of migrationFiles) {
      const migrationPath = path.join(migrationsDir, file);
      const migration = fs.readFileSync(migrationPath, 'utf-8');
      this.db.exec(migration);
      console.log(`Applied migration: ${file}`);
    }
  }
}
