import { Service } from 'typedi';
import Database from 'better-sqlite3';
import { BaseRepository } from './base.repository';
import { DbEpic, Epic, CreateEpicDto, UpdateEpicDto } from '../types';

@Service()
export class EpicsRepository extends BaseRepository {
  private database(): Database.Database {
    return this.db.getDatabase();
  }

  findByProjectId(projectId: string): Epic[] {
    const stmt = this.database().prepare<[string], DbEpic>(`
      SELECT * FROM epics WHERE project_id = ? ORDER BY position ASC, created_at ASC
    `);
    const rows = stmt.all(projectId);
    return rows.map(row => this.toEpic(row));
  }

  findById(id: string): Epic | null {
    const stmt = this.database().prepare<[string], DbEpic>('SELECT * FROM epics WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.toEpic(row) : null;
  }

  create(dto: CreateEpicDto): Epic {
    const id = this.generateId('e');
    const now = Math.floor(Date.now() / 1000);

    // Get next position
    const positionResult = this.database().prepare(`
      SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM epics WHERE project_id = ?
    `).get(dto.project_id) as { next_pos: number };
    const position = positionResult.next_pos;

    this.database().prepare(`
      INSERT INTO epics (id, project_id, name, color, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(id, dto.project_id, dto.name, dto.color || '#06b6d4', position, now, now);

    return this.findById(id)!;
  }

  update(id: string, dto: UpdateEpicDto): Epic | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.color !== undefined) {
      updates.push('color = ?');
      values.push(dto.color);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    this.database().prepare(`
      UPDATE epics SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.database().prepare('DELETE FROM epics WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toEpic(db: DbEpic): Epic {
    return {
      id: db.id,
      projectId: db.project_id,
      name: db.name,
      color: db.color,
      position: db.position,
      createdAt: this.timestampToIso(db.created_at),
      updatedAt: this.timestampToIso(db.updated_at),
    };
  }
}
