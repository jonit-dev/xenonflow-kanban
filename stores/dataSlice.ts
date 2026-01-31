import { StateCreator } from 'zustand';
import { ColumnType, Epic, Project, Ticket, TicketStatus } from '../types';
import { columnsApi, epicsApi, projectsApi, ticketsApi, type ApiEpic, type ApiProject, type ApiTicket } from '../services/apiService';
import { DraftTicket } from './types';
import { UISlice } from './uiSlice';

// Mapper functions
const mapApiTicket = (api: ApiTicket): Ticket => ({
  id: api.id,
  title: api.title,
  description: api.description || '',
  status: api.status as TicketStatus,
  impact: api.impact as 'low' | 'medium' | 'high' | 'critical',
  effort: api.effort,
  epicId: api.epicId,
  assignee: api.assigneeId,
  startDate: api.startDate,
  endDate: api.endDate,
  aiInsights: api.aiInsights,
  prUrl: api.prUrl,
  flagged: api.flagged,
  requiresHuman: api.requiresHuman,
});

const mapApiEpic = (api: ApiEpic): Epic => ({
  id: api.id,
  name: api.name,
  color: api.color,
});

const mapApiColumn = (api: any): ColumnType => ({
  id: api.id,
  projectId: api.projectId,
  title: api.title,
  statusKey: api.statusKey,
  position: api.position,
});

const mapApiProject = (api: ApiProject, epics: Epic[], tickets: Ticket[], columns: ColumnType[]): Project => ({
  id: api.id,
  name: api.name,
  description: api.description,
  goal: api.goal,
  epics,
  tickets,
  columns,
});

const EPIC_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#ec4899'];

export interface DataSlice {
  // Data
  projects: Project[];

  // Computed (getter function, not state)
  getActiveProject: () => Project | null;

  // Actions
  loadProjects: () => Promise<void>;
  loadProjectDetails: (projectId: string) => Promise<void>;
  createProject: (name: string) => Promise<void>;
  deleteProject: (projectId: string, secret: string) => Promise<void>;
  createEpic: (name: string) => Promise<void>;
  createTicket: (initialStatus?: TicketStatus, startDate?: string, endDate?: string) => void;
  saveTicket: (ticket: Ticket) => Promise<void>;
  deleteTicket: (ticketId: string) => Promise<void>;
  moveTicketToBoard: (ticket: Ticket) => Promise<void>;
  createColumn: (title: string, statusKey: string) => Promise<void>;
  updateColumn: (columnId: string, title: string) => Promise<void>;
  deleteColumn: (columnId: string) => Promise<void>;
  updateTicketStatus: (ticketId: string, status: TicketStatus) => Promise<void>;
}

export const createDataSlice: StateCreator<
  DataSlice & UISlice,
  [],
  [],
  DataSlice
> = (set, get) => ({
  // Initial state
  projects: [],

  // Computed getter
  getActiveProject: () => {
    const state = get() as DataSlice & UISlice;
    return state.projects.find((p) => p.id === state.activeProjectId) || null;
  },

  // Load all projects
  loadProjects: async () => {
    try {
      get().setIsLoading(true);
      const apiProjects = await projectsApi.list();
      const mappedProjects = apiProjects.map((p) => ({
        id: p.id,
        name: p.name,
        description: p.description,
        goal: p.goal,
        epics: [] as Epic[],
        tickets: [] as Ticket[],
        columns: [] as ColumnType[],
      }));
      set({ projects: mappedProjects });

      const currentActiveProjectId = get().activeProjectId;
      if (mappedProjects.length > 0 && !currentActiveProjectId) {
        get().setActiveProjectId(mappedProjects[0].id);
        await get().loadProjectDetails(mappedProjects[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      set({ isLoading: false });
    }
  },

  // Load project details
  loadProjectDetails: async (projectId) => {
    try {
      const { project, epics, tickets, columns } = await projectsApi.getWithDetails(projectId);

      const mappedEpics = epics.map(mapApiEpic);
      const mappedTickets = tickets.map(mapApiTicket);
      const mappedColumns = columns.map(mapApiColumn);
      const mappedProject = mapApiProject(project, mappedEpics, mappedTickets, mappedColumns);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === projectId ? mappedProject : p
        ),
      }));
    } catch (error) {
      console.error('Failed to load project details:', error);
    }
  },

  // Create project
  createProject: async (name) => {
    try {
      const newProject = await projectsApi.create({ name });
      const { columns } = await projectsApi.getWithDetails(newProject.id);
      const mappedColumns = columns.map(mapApiColumn);
      const mappedProject = mapApiProject(newProject, [], [], mappedColumns);

      set((state) => ({
        projects: [...state.projects, mappedProject],
      }));

      get().setActiveProjectId(newProject.id);
      await get().loadProjectDetails(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  },

  // Delete project (requires secret - only Joao can delete)
  deleteProject: async (projectId, secret) => {
    try {
      await projectsApi.delete(projectId, secret);

      const state = get();
      const remainingProjects = state.projects.filter((p) => p.id !== projectId);
      const wasActiveProject = state.activeProjectId === projectId;

      set(() => ({
        projects: remainingProjects,
      }));

      // If deleted project was active, switch to another
      if (wasActiveProject) {
        if (remainingProjects.length > 0) {
          get().setActiveProjectId(remainingProjects[0].id);
          await get().loadProjectDetails(remainingProjects[0].id);
        } else {
          get().setActiveProjectId('');
        }
      }
    } catch (error) {
      console.error('Failed to delete project:', error);
      throw error;
    }
  },

  // Create epic
  createEpic: async (name) => {
    const activeProjectId = get().activeProjectId;
    const activeProject = get().getActiveProject();
    if (!activeProjectId) return;

    try {
      const color = EPIC_COLORS[(activeProject?.epics.length || 0) % EPIC_COLORS.length];
      const newEpic = await epicsApi.create({ projectId: activeProjectId, name, color });
      const mappedEpic = mapApiEpic(newEpic);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === activeProjectId
            ? { ...p, epics: [...p.epics, mappedEpic] }
            : p
        ),
      }));
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  },

  // Create ticket (opens modal with draft)
  createTicket: (initialStatus = TicketStatus.BACKLOG, startDate?: string, endDate?: string) => {
    const activeProjectId = get().activeProjectId;

    if (!activeProjectId) {
      alert('No active project selected');
      return;
    }

    const draftTicket: DraftTicket = {
      id: '',
      title: 'UNIDENTIFIED UNIT',
      description: '',
      status: initialStatus,
      impact: 'low',
      effort: 0,
      startDate,
      endDate,
      epicId: undefined,
      assignee: undefined,
      flagged: false,
      requiresHuman: false,
      isDirty: false,
    };

    get().openTicketModal('', draftTicket);
  },

  // Save ticket (closeAfterSave option for explicit save vs auto-save)
  saveTicket: async (ticketToSave, closeAfterSave = false) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) {
      console.error('No active project');
      return;
    }

    try {
      const isNew = !ticketToSave.id || ticketToSave.id === '';

      let savedTicket: ApiTicket;

      if (isNew) {
        savedTicket = await ticketsApi.create({
          projectId: activeProjectId,
          title: ticketToSave.title,
          description: ticketToSave.description,
          status: ticketToSave.status,
          impact: ticketToSave.impact,
          effort: ticketToSave.effort,
          epicId: ticketToSave.epicId,
          assigneeId: ticketToSave.assignee,
          startDate: ticketToSave.startDate,
          endDate: ticketToSave.endDate,
          flagged: ticketToSave.flagged,
          requiresHuman: ticketToSave.requiresHuman,
        });
      } else {
        savedTicket = await ticketsApi.update(ticketToSave.id, {
          title: ticketToSave.title,
          description: ticketToSave.description,
          status: ticketToSave.status,
          impact: ticketToSave.impact,
          effort: ticketToSave.effort,
          epicId: ticketToSave.epicId,
          assigneeId: ticketToSave.assignee,
          startDate: ticketToSave.startDate,
          endDate: ticketToSave.endDate,
          flagged: ticketToSave.flagged,
          requiresHuman: ticketToSave.requiresHuman,
        });
      }

      // Refresh project details
      await get().loadProjectDetails(activeProjectId);

      // Only close modal and reset draft if explicitly requested (for new tickets or explicit save)
      if (closeAfterSave) {
        get().resetDraftTicket();
        get().closeTicketModal();
      }
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Failed to save ticket. Check console for details.');
    }
  },

  // Delete ticket
  deleteTicket: async (ticketId) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) return;

    try {
      await ticketsApi.delete(ticketId);

      // Close modal first
      if (get().modal.ticket.ticketId === ticketId) {
        get().closeTicketModal();
        get().resetDraftTicket();
      }

      // Refresh from server to ensure consistency
      await get().loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  },

  // Move ticket to board
  moveTicketToBoard: async (ticket) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId || !ticket.id) return;

    try {
      const updated = await ticketsApi.updateStatus(ticket.id, TicketStatus.TODO);

      set((state) => ({
        projects: state.projects.map((p) =>
          p.id === activeProjectId
            ? {
                ...p,
                tickets: p.tickets.map((t) =>
                  t.id === ticket.id ? mapApiTicket(updated) : t
                ),
              }
            : p
        ),
      }));
    } catch (error) {
      console.error('Failed to move ticket to board:', error);
    }
  },

  // Create column
  createColumn: async (title, statusKey) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) return;

    try {
      await columnsApi.create({ projectId: activeProjectId, title, statusKey });
      await get().loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to create column:', error);
    }
  },

  // Update column
  updateColumn: async (columnId, title) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) return;

    try {
      await columnsApi.update(columnId, { title });
      await get().loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to update column:', error);
    }
  },

  // Delete column
  deleteColumn: async (columnId) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) return;

    if (
      !confirm(
        'Are you sure you want to delete this column? Tickets in this column will remain in the database but won\'t be visible on the board.'
      )
    )
      return;

    try {
      await columnsApi.delete(columnId);
      await get().loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to delete column:', error);
    }
  },

  // Update ticket status (for drag and drop)
  updateTicketStatus: async (ticketId, status) => {
    const activeProjectId = get().activeProjectId;
    if (!activeProjectId) return;

    try {
      await ticketsApi.updateStatus(ticketId, status);
      await get().loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to update ticket status:', error);
    }
  },
});
