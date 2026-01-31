import { Service } from 'typedi';
import Database from 'better-sqlite3';
import { BaseRepository } from './base.repository';
import { DbProject, Project, CreateProjectDto, UpdateProjectDto } from '../types';

@Service()
export class ProjectsRepository extends BaseRepository {
  private database(): Database.Database {
    return this.db.getDatabase();
  }

  findAll(): Project[] {
    const stmt = this.database().prepare<[], DbProject>(`
      SELECT * FROM projects ORDER BY created_at DESC
    `);
    const rows = stmt.all();
    return rows.map(row => this.toProject(row));
  }

  findById(id: string): Project | null {
    const stmt = this.database().prepare<[string], DbProject>('SELECT * FROM projects WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.toProject(row) : null;
  }

  create(dto: CreateProjectDto): Project {
    const id = this.generateId('p');
    const now = Math.floor(Date.now() / 1000);

    this.database().prepare(`
      INSERT INTO projects (id, name, description, created_at, updated_at)
      VALUES (?, ?, ?, ?, ?)
    `).run(id, dto.name, dto.description || null, now, now);

    return this.findById(id)!;
  }

  update(id: string, dto: UpdateProjectDto): Project | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.name !== undefined) {
      updates.push('name = ?');
      values.push(dto.name);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    this.database().prepare(`
      UPDATE projects SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return this.findById(id);
  }

  delete(id: string): boolean {
    const result = this.database().prepare('DELETE FROM projects WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toProject(db: DbProject): Project {
    return {
      id: db.id,
      name: db.name,
      description: db.description || undefined,
      createdAt: this.timestampToIso(db.created_at),
      updatedAt: this.timestampToIso(db.updated_at),
    };
  }
}
