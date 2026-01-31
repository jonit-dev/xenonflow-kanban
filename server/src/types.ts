// Enums
export enum TicketStatus {
  BACKLOG = 'BACKLOG',
  TODO = 'TODO',
  IN_PROGRESS = 'IN_PROGRESS',
  REVIEW = 'REVIEW',
  DONE = 'DONE',
}

export enum TicketPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high',
  CRITICAL = 'critical',
}

// Aliases for clarity - TicketPriority now represents "Impact"
export { TicketPriority as TicketImpact };

// Database Models (as returned from SQLite)
export interface DbUser {
  id: string;
  username: string;
  email: string;
  created_at: number;
  updated_at: number;
}

export interface DbProject {
  id: string;
  name: string;
  description: string | null;
  created_at: number;
  updated_at: number;
}

export interface DbColumn {
  id: string;
  project_id: string;
  title: string;
  status_key: string;
  position: number;
  created_at: number;
  updated_at: number;
}

export interface DbEpic {
  id: string;
  project_id: string;
  name: string;
  color: string;
  position: number;
  created_at: number;
  updated_at: number;
}

export interface DbTicket {
  id: string;
  project_id: string;
  epic_id: string | null;
  assignee_id: string | null;
  title: string;
  description: string | null;
  status: TicketStatus;
  impact: TicketPriority; // Renamed from priority
  effort: number; // Renamed from story_points
  start_date: string | null;
  end_date: string | null;
  ai_insights: string | null;
  pr_url: string | null; // GitHub PR URL
  position: number;
  flagged: number; // 0 or 1
  requires_human: number; // 0 or 1
  created_at: number;
  updated_at: number;
}

// DTOs (Request/Response)
export interface CreateProjectDto {
  name: string;
  description?: string;
}

export interface UpdateProjectDto {
  name?: string;
  description?: string;
}

export interface CreateEpicDto {
  project_id: string;
  name: string;
  color?: string;
}

export interface UpdateEpicDto {
  name?: string;
  color?: string;
}

export interface CreateTicketDto {
  project_id: string;
  title: string;
  description?: string;
  status?: TicketStatus;
  impact?: TicketPriority; // Renamed from priority
  effort?: number; // Renamed from story_points
  epic_id?: string;
  assignee_id?: string;
  start_date?: string;
  end_date?: string;
  pr_url?: string; // GitHub PR URL
  flagged?: boolean;
  requiresHuman?: boolean;
}

export interface UpdateTicketDto {
  title?: string;
  description?: string;
  status?: TicketStatus;
  impact?: TicketPriority; // Renamed from priority
  effort?: number; // Renamed from story_points
  epic_id?: string;
  assignee_id?: string;
  start_date?: string;
  end_date?: string;
  ai_insights?: string;
  pr_url?: string; // GitHub PR URL
  flagged?: boolean;
  requiresHuman?: boolean;
}

export interface UpdateTicketStatusDto {
  status: TicketStatus;
}

export interface CreateColumnDto {
  project_id: string;
  title: string;
  status_key: string;
  position?: number;
}

export interface UpdateColumnDto {
  title?: string;
  status_key?: string;
  position?: number;
}

export interface CreateUserDto {
  username: string;
  email: string;
}

export interface UpdateUserDto {
  username?: string;
  email?: string;
}

// API Response Models (with converted timestamps)
export interface User {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Project {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Epic {
  id: string;
  projectId: string;
  name: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Column {
  id: string;
  projectId: string;
  title: string;
  statusKey: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface Ticket {
  id: string;
  projectId: string;
  epicId?: string;
  assigneeId?: string;
  title: string;
  description?: string; // Supports markdown
  status: TicketStatus;
  impact: TicketPriority; // Renamed from priority - represents business impact
  effort: number; // Renamed from storyPoints - represents implementation effort
  startDate?: string;
  endDate?: string;
  aiInsights?: string;
  prUrl?: string; // GitHub PR URL
  position: number;
  flagged?: boolean; // Important/urgent flag
  requiresHuman?: boolean; // Needs human intervention
  createdAt: string;
  updatedAt: string;
}

export interface ProjectWithDetails extends Project {
  epics: Epic[];
  tickets: Ticket[];
  columns: Column[];
}
