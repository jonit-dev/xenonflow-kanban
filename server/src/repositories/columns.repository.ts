import Database from 'better-sqlite3';
import { Service } from 'typedi';
import { Column, CreateColumnDto, DbColumn, UpdateColumnDto } from '../types';
import { BaseRepository } from './base.repository';

@Service()
export class ColumnsRepository extends BaseRepository {
  private database(): Database.Database {
    return this.db.getDatabase();
  }

  findByProjectId(projectId: string): Column[] {
    const stmt = this.database().prepare<[string], DbColumn>(`
      SELECT * FROM columns WHERE project_id = ? ORDER BY position ASC, created_at ASC
    `);
    const rows = stmt.all(projectId);
    return rows.map((row) => this.toColumn(row));
  }

  findById(id: string): Column | null {
    const stmt = this.database().prepare<[string], DbColumn>(
      'SELECT * FROM columns WHERE id = ?',
    );
    const row = stmt.get(id);
    return row ? this.toColumn(row) : null;
  }

  create(dto: CreateColumnDto): Column {
    const id = this.generateId('col');
    const now = Math.floor(Date.now() / 1000);

    // Get next position if not provided
    let position = dto.position;
    if (position === undefined) {
      const positionResult = this.database()
        .prepare(
          `
        SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM columns WHERE project_id = ?
      `,
        )
        .get(dto.project_id) as { next_pos: number };
      position = positionResult.next_pos;
    }

    this.database()
      .prepare(
        `
      INSERT INTO columns (id, project_id, title, status_key, position, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `,
      )
      .run(id, dto.project_id, dto.title, dto.status_key, position, now, now);

    return this.findById(id)!;
  }

  update(id: string, dto: UpdateColumnDto): Column | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
    }
    if (dto.status_key !== undefined) {
      updates.push('status_key = ?');
      values.push(dto.status_key);
    }
    if (dto.position !== undefined) {
      updates.push('position = ?');
      values.push(dto.position);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    this.database()
      .prepare(
        `
      UPDATE columns SET ${updates.join(', ')} WHERE id = ?
    `,
      )
      .run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.database()
      .prepare('DELETE FROM columns WHERE id = ?')
      .run(id);
    return result.changes > 0;
  }

  private toColumn(db: DbColumn): Column {
    return {
      id: db.id,
      projectId: db.project_id,
      title: db.title,
      statusKey: db.status_key,
      position: db.position,
      createdAt: this.timestampToIso(db.created_at),
      updatedAt: this.timestampToIso(db.updated_at),
    };
  }
}
