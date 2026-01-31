import { Service } from 'typedi';
import Database from 'better-sqlite3';
import { BaseRepository } from './base.repository';
import { DbTicket, Ticket, CreateTicketDto, UpdateTicketDto, TicketStatus } from '../types';

@Service()
export class TicketsRepository extends BaseRepository {
  private database(): Database.Database {
    return this.db.getDatabase();
  }

  findByProjectId(projectId: string): Ticket[] {
    const stmt = this.database().prepare<[string], DbTicket>(`
      SELECT * FROM tickets WHERE project_id = ? ORDER BY position ASC, created_at ASC
    `);
    const rows = stmt.all(projectId);
    return rows.map(row => this.toTicket(row));
  }

  findByEpicId(epicId: string): Ticket[] {
    const stmt = this.database().prepare<[string], DbTicket>(`
      SELECT * FROM tickets WHERE epic_id = ? ORDER BY position ASC, created_at ASC
    `);
    const rows = stmt.all(epicId);
    return rows.map(row => this.toTicket(row));
  }

  findById(id: string): Ticket | null {
    const stmt = this.database().prepare<[string], DbTicket>('SELECT * FROM tickets WHERE id = ?');
    const row = stmt.get(id);
    return row ? this.toTicket(row) : null;
  }

  create(dto: CreateTicketDto): Ticket {
    const id = this.generateId('t');
    const now = Math.floor(Date.now() / 1000);

    // Get next position
    const positionResult = this.database().prepare(`
      SELECT COALESCE(MAX(position), -1) + 1 as next_pos FROM tickets WHERE project_id = ?
    `).get(dto.project_id) as { next_pos: number };
    const position = positionResult.next_pos;

    this.database().prepare(`
      INSERT INTO tickets (
        id, project_id, epic_id, assignee_id, title, description, status, impact,
        effort, start_date, end_date, ai_insights, pr_url, position, flagged, requires_human, created_at, updated_at
      )
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(
      id,
      dto.project_id,
      dto.epic_id || null,
      dto.assignee_id || null,
      dto.title,
      dto.description || null,
      dto.status || TicketStatus.TODO,
      dto.impact || 'low',
      dto.effort || 0,
      dto.start_date || null,
      dto.end_date || null,
      null,
      dto.pr_url || null,
      position,
      dto.flagged ? 1 : 0,
      dto.requiresHuman ? 1 : 0,
      now,
      now
    );

    return this.findById(id)!;
  }

  update(id: string, dto: UpdateTicketDto): Ticket | null {
    const existing = this.findById(id);
    if (!existing) return null;

    const updates: string[] = [];
    const values: any[] = [];

    if (dto.title !== undefined) {
      updates.push('title = ?');
      values.push(dto.title);
    }
    if (dto.description !== undefined) {
      updates.push('description = ?');
      values.push(dto.description);
    }
    if (dto.status !== undefined) {
      updates.push('status = ?');
      values.push(dto.status);
    }
    if (dto.impact !== undefined) {
      updates.push('impact = ?');
      values.push(dto.impact);
    }
    if (dto.effort !== undefined) {
      updates.push('effort = ?');
      values.push(dto.effort);
    }
    if (dto.epic_id !== undefined) {
      updates.push('epic_id = ?');
      values.push(dto.epic_id);
    }
    if (dto.assignee_id !== undefined) {
      updates.push('assignee_id = ?');
      values.push(dto.assignee_id);
    }
    if (dto.start_date !== undefined) {
      updates.push('start_date = ?');
      values.push(dto.start_date);
    }
    if (dto.end_date !== undefined) {
      updates.push('end_date = ?');
      values.push(dto.end_date);
    }
    if (dto.ai_insights !== undefined) {
      updates.push('ai_insights = ?');
      values.push(dto.ai_insights);
    }
    if (dto.pr_url !== undefined) {
      updates.push('pr_url = ?');
      values.push(dto.pr_url);
    }
    if (dto.flagged !== undefined) {
      updates.push('flagged = ?');
      values.push(dto.flagged ? 1 : 0);
    }
    if (dto.requiresHuman !== undefined) {
      updates.push('requires_human = ?');
      values.push(dto.requiresHuman ? 1 : 0);
    }

    if (updates.length === 0) return existing;

    updates.push('updated_at = ?');
    values.push(Math.floor(Date.now() / 1000));
    values.push(id);

    this.database().prepare(`
      UPDATE tickets SET ${updates.join(', ')} WHERE id = ?
    `).run(...values);

    return this.findById(id);
  }

  updateStatus(id: string, status: TicketStatus): Ticket | null {
    return this.update(id, { status });
  }

  delete(id: string): boolean {
    const result = this.database().prepare('DELETE FROM tickets WHERE id = ?').run(id);
    return result.changes > 0;
  }

  private toTicket(db: DbTicket): Ticket {
    return {
      id: db.id,
      projectId: db.project_id,
      epicId: db.epic_id || undefined,
      assigneeId: db.assignee_id || undefined,
      title: db.title,
      description: db.description || undefined,
      status: db.status,
      impact: db.impact,
      effort: db.effort,
      startDate: db.start_date || undefined,
      endDate: db.end_date || undefined,
      aiInsights: db.ai_insights || undefined,
      prUrl: db.pr_url || undefined,
      position: db.position,
      flagged: db.flagged === 1,
      requiresHuman: db.requires_human === 1,
      createdAt: this.timestampToIso(db.created_at),
      updatedAt: this.timestampToIso(db.updated_at),
    };
  }
}
