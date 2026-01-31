import { Service } from 'typedi';
import Database from 'better-sqlite3';
import { BaseRepository } from './base.repository';
import { DbUser, User, CreateUserDto, UpdateUserDto } from '../types';

@Service()
export class UsersRepository extends BaseRepository {
  private database(): Database.Database {
    return this.db.getDatabase();
  }

  findAll(): User[] {
    const stmt = this.database().prepare<[], DbUser>(`
      SELECT * FROM users ORDER BY username ASC
    `);
    const rows = stmt.all();
    return rows.map(row => this.toUser(row));
  }

  findById(id: string): User | null {
    const stmt = this.database().prepare<[string], DbUser>('SELECT * FROM users WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.toUser(row) : null;
  }

  findByUsername(username: string): User | null {
    const stmt = this.database().prepare<[string], DbUser>('SELECT * FROM users WHERE username = ?');
    const row = stmt.get(username);
    return row ? this.toUser(row) : null;
  }

  create(dto: CreateUserDto): User {
    const id = this.generateId('u');
    const now = Math.floor(Date.now() / 1000);

    this.database().prepare(`
      INSERT INTO users (id, username, email, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, dto.username, dto.email, now, now);

    return this.findById(id)!;
  }

  update(id: string, dto: UpdateUserDto): User | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.username !== undefined) {
      updates.push('username = ?');
      values.push(dto.username);
    }
    if (dto.email !== undefined) {
      updates.push('email = ?');
      values.push(dto.email);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    this.database().prepare(`
      UPDATE users SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.database().prepare('DELETE FROM users WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toUser(db: DbUser): User {
    return {
      id: db.id,
      username: db.username,
      email: db.email,
      createdAt: this.timestampToIso(db.created_at),
      updatedAt: this.timestampToIso(db.updated_at),
    };
  }
}
