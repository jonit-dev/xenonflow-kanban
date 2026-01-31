const API_BASE = 'http://localhost:3333/api';

// Types matching backend response
export interface ApiProject {
  id: string;
  name: string;
  description?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiEpic {
  id: string;
  projectId: string;
  name: string;
  color: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

export interface ApiTicket {
  id: string;
  projectId: string;
  epicId?: string;
  assigneeId?: string;
  title: string;
  description?: string;
  status: string;
  priority: string;
  storyPoints: number;
  startDate?: string;
  endDate?: string;
  aiInsights?: string;
  position: number;
  flagged?: boolean;
  requiresHuman?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ApiUser {
  id: string;
  username: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiColumn {
  id: string;
  projectId: string;
  title: string;
  statusKey: string;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// API Client
async function api<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  const response = await fetch(url, {
    headers: {
      'Content-Type': 'application/json',
      ...options?.headers,
    },
    ...options,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API error: ${response.status} - ${error}`);
  }

  return response.json();
}

// Projects
export const projectsApi = {
  list: () => api<ApiProject[]>('/projects'),

  get: (id: string) => api<ApiProject>(`/projects/${id}`),

  getWithDetails: async (
    id: string,
  ): Promise<{
    project: ApiProject;
    epics: ApiEpic[];
    tickets: ApiTicket[];
    columns: ApiColumn[];
  }> => {
    return api<{
      project: ApiProject;
      epics: ApiEpic[];
      tickets: ApiTicket[];
      columns: ApiColumn[];
    }>(`/projects/${id}/details`);
  },

  create: (data: { name: string; description?: string }) =>
    api<ApiProject>('/projects', {
      method: 'POST',
      body: JSON.stringify(data),
    }),

  update: (id: string, data: { name?: string; description?: string }) =>
    api<ApiProject>(`/projects/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    api<void>(`/projects/${id}`, {
      method: 'DELETE',
    }),
};

// Epics
export const epicsApi = {
  list: (projectId: string) => api<ApiEpic[]>(`/epics/project/${projectId}`),

  get: (id: string) => api<ApiEpic>(`/epics/${id}`),

  create: (data: { projectId: string; name: string; color?: string }) => {
    const snakeCaseData = {
      project_id: data.projectId,
      name: data.name,
      color: data.color,
    };
    return api<ApiEpic>('/epics', {
      method: 'POST',
      body: JSON.stringify(snakeCaseData),
    });
  },

  update: (id: string, data: { name?: string; color?: string }) =>
    api<ApiEpic>(`/epics/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    }),

  delete: (id: string) =>
    api<void>(`/epics/${id}`, {
      method: 'DELETE',
    }),
};

// Tickets
export const ticketsApi = {
  list: (projectId: string) =>
    api<ApiTicket[]>(`/tickets/project/${projectId}`),

  get: (id: string) => api<ApiTicket>(`/tickets/${id}`),

  create: (data: {
    projectId: string;
    title: string;
    description?: string;
    status?: string;
    priority?: string;
    storyPoints?: number;
    epicId?: string;
    assigneeId?: string;
    startDate?: string;
    endDate?: string;
    flagged?: boolean;
    requiresHuman?: boolean;
  }) => {
    console.log('ticketsApi.create called with:', data);

    // Convert camelCase to snake_case for backend
    const snakeCaseData = {
      project_id: data.projectId,
      title: data.title,
      description: data.description,
      status: data.status,
      priority: data.priority,
      story_points: data.storyPoints,
      epic_id: data.epicId,
      assignee_id: data.assigneeId,
      start_date: data.startDate,
      end_date: data.endDate,
      flagged: data.flagged,
      requiresHuman: data.requiresHuman,
    };

    console.log('Sending to backend (snake_case):', snakeCaseData);

    return api<ApiTicket>('/tickets', {
      method: 'POST',
      body: JSON.stringify(snakeCaseData),
    });
  },

  update: (id: string, data: Partial<ApiTicket>) => {
    // Convert camelCase to snake_case for backend
    const snakeCaseData: any = {};
    if (data.title !== undefined) snakeCaseData.title = data.title;
    if (data.description !== undefined)
      snakeCaseData.description = data.description;
    if (data.status !== undefined) snakeCaseData.status = data.status;
    if (data.priority !== undefined) snakeCaseData.priority = data.priority;
    if (data.storyPoints !== undefined)
      snakeCaseData.story_points = data.storyPoints;
    if (data.epicId !== undefined) snakeCaseData.epic_id = data.epicId;
    if (data.assigneeId !== undefined)
      snakeCaseData.assignee_id = data.assigneeId;
    if (data.startDate !== undefined) snakeCaseData.start_date = data.startDate;
    if (data.endDate !== undefined) snakeCaseData.end_date = data.endDate;
    if (data.aiInsights !== undefined)
      snakeCaseData.ai_insights = data.aiInsights;
    if (data.flagged !== undefined) snakeCaseData.flagged = data.flagged;
    if (data.requiresHuman !== undefined)
      snakeCaseData.requiresHuman = data.requiresHuman;

    return api<ApiTicket>(`/tickets/${id}`, {
      method: 'PUT',
      body: JSON.stringify(snakeCaseData),
    });
  },

  updateStatus: (id: string, status: string) =>
    api<ApiTicket>(`/tickets/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    }),

  delete: (id: string) =>
    api<void>(`/tickets/${id}`, {
      method: 'DELETE',
    }),
};

// Columns
export const columnsApi = {
  list: (projectId: string) =>
    api<ApiColumn[]>(`/columns/project/${projectId}`),

  create: (data: {
    projectId: string;
    title: string;
    statusKey: string;
    position?: number;
  }) => {
    const snakeCaseData = {
      project_id: data.projectId,
      title: data.title,
      status_key: data.statusKey,
      position: data.position,
    };
    return api<ApiColumn>('/columns', {
      method: 'POST',
      body: JSON.stringify(snakeCaseData),
    });
  },

  update: (
    id: string,
    data: { title?: string; statusKey?: string; position?: number },
  ) => {
    const snakeCaseData: any = {};
    if (data.title !== undefined) snakeCaseData.title = data.title;
    if (data.statusKey !== undefined) snakeCaseData.status_key = data.statusKey;
    if (data.position !== undefined) snakeCaseData.position = data.position;

    return api<ApiColumn>(`/columns/${id}`, {
      method: 'PUT',
      body: JSON.stringify(snakeCaseData),
    });
  },

  delete: (id: string) =>
    api<void>(`/columns/${id}`, {
      method: 'DELETE',
    }),
};

// Health check
export const healthApi = {
  check: () => api<{ status: string; timestamp: string }>('/health'),
};
