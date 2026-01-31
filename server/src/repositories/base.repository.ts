import { Service } from 'typedi';
import { DatabaseClient } from '../database/database.client';
import { RunResult } from 'better-sqlite3';

@Service()
export class BaseRepository {
  constructor(protected db: DatabaseClient) {}

  protected generateId(prefix: string): string {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  }

  protected timestampToIso(epoch: number): string {
    return new Date(epoch * 1000).toISOString();
  }
}
