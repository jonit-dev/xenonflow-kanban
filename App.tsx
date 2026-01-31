import React, { useState, useEffect } from 'react';
import { Project, Ticket, TicketStatus, Epic } from './types';
import { Sidebar } from './components/Sidebar';
import { Column } from './components/BoardComponents';
import { TimelineView } from './components/TimelineView';
import { BacklogView } from './components/BacklogView';
import { MotherModal } from './components/MotherModal';
import { TicketDetailModal } from './components/TicketDetailModal';
import { Button } from './components/ui/Button';
import { Plus, Layout, Calendar, List } from 'lucide-react';
import { consultMotherOnTicket, consultMotherOnProject } from './services/geminiService';
import { projectsApi, epicsApi, ticketsApi, type ApiProject, type ApiEpic, type ApiTicket } from './services/apiService';

const COLUMNS = [
  { id: TicketStatus.TODO, title: 'PENDING' },
  { id: TicketStatus.IN_PROGRESS, title: 'ACTIVE' },
  { id: TicketStatus.REVIEW, title: 'ANALYSIS' },
  { id: TicketStatus.DONE, title: 'ARCHIVED' },
];

const EPIC_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#ec4899'];

type ViewMode = 'BOARD' | 'TIMELINE' | 'BACKLOG';

// Helper to map API types to frontend types
const mapApiTicket = (api: ApiTicket): Ticket => ({
  id: api.id,
  title: api.title,
  description: api.description || '',
  status: api.status as TicketStatus,
  priority: api.priority as 'low' | 'medium' | 'high' | 'critical',
  storyPoints: api.storyPoints,
  epicId: api.epicId,
  assignee: api.assigneeId,
  startDate: api.startDate,
  endDate: api.endDate,
  aiInsights: api.aiInsights,
});

const mapApiEpic = (api: ApiEpic): Epic => ({
  id: api.id,
  name: api.name,
  color: api.color,
});

const mapApiProject = (api: ApiProject, epics: Epic[], tickets: Ticket[]): Project => ({
  id: api.id,
  name: api.name,
  description: api.description,
  epics,
  tickets,
});

export default function App() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string>('');
  const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
  const [loading, setLoading] = useState(true);
  
  // AI Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ticket Edit Modal State
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Drag and Drop State
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  // Active Project Derived State
  const activeProject = projects.find(p => p.id === activeProjectId);

  // Load all projects on mount
  useEffect(() => {
    loadProjects();

    // Test API connectivity
    fetch('http://localhost:3333/health')
      .then(r => r.json())
      .then(d => console.log('API health check:', d))
      .catch(e => console.error('API health check failed:', e));
  }, []);

  // Load project details when active project changes
  useEffect(() => {
    if (activeProjectId) {
      loadProjectDetails(activeProjectId);
    }
  }, [activeProjectId]);

  const loadProjects = async () => {
    try {
      setLoading(true);
      const apiProjects = await projectsApi.list();
      const mappedProjects = apiProjects.map(p => ({
        id: p.id,
        name: p.name,
        description: p.description,
        epics: [] as Epic[],
        tickets: [] as Ticket[],
      }));
      setProjects(mappedProjects);
      
      if (mappedProjects.length > 0 && !activeProjectId) {
        setActiveProjectId(mappedProjects[0].id);
      }
    } catch (error) {
      console.error('Failed to load projects:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjectDetails = async (projectId: string) => {
    try {
      const { project, epics, tickets } = await projectsApi.getWithDetails(projectId);
      
      const mappedEpics = epics.map(mapApiEpic);
      const mappedTickets = tickets.map(mapApiTicket);
      const mappedProject = mapApiProject(project, mappedEpics, mappedTickets);

      setProjects(prev => prev.map(p =>
        p.id === projectId ? mappedProject : p
      ));
    } catch (error) {
      console.error('Failed to load project details:', error);
    }
  };

  // --- Handlers ---

  const handleCreateProject = async (name: string) => {
    try {
      const newProject = await projectsApi.create({ name });
      const mappedProject = mapApiProject(newProject, [], []);
      setProjects([...projects, mappedProject]);
      setActiveProjectId(newProject.id);
    } catch (error) {
      console.error('Failed to create project:', error);
    }
  };

  const handleCreateEpic = async (name: string) => {
    if (!activeProjectId) return;
    
    try {
      const color = EPIC_COLORS[activeProject?.epics.length || 0 % EPIC_COLORS.length];
      const newEpic = await epicsApi.create({ projectId: activeProjectId, name, color });
      const mappedEpic = mapApiEpic(newEpic);

      setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
          return { ...p, epics: [...p.epics, mappedEpic] };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to create epic:', error);
    }
  }

  const handleCreateTicket = () => {
    console.log('Spawn Entity button clicked');
    console.log('activeProjectId:', activeProjectId);
    console.log('viewMode:', viewMode);

    if (!activeProjectId) {
      alert('No active project selected');
      return;
    }

    const isTimeline = viewMode === 'TIMELINE';
    const isBacklog = viewMode === 'BACKLOG';

    const initialStatus = isBacklog ? TicketStatus.BACKLOG : TicketStatus.TODO;

    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (isTimeline) {
      const now = new Date();
      startDate = now.toISOString().split('T')[0];
      const end = new Date(now);
      end.setDate(end.getDate() + 2);
      endDate = end.toISOString().split('T')[0];
    }

    const draftTicket: Ticket = {
      id: '', // Will be set by API
      title: 'UNIDENTIFIED UNIT',
      description: '',
      status: initialStatus,
      priority: 'low',
      storyPoints: 0,
      startDate,
      endDate,
      epicId: undefined,
      assignee: undefined,
    };

    console.log('Opening modal for ticket:', draftTicket);
    setEditingTicket(draftTicket);
    console.log('Modal should now be open. editingTicket state set.');
  };

  const handleSaveTicket = async (ticketToSave: Ticket) => {
    if (!activeProjectId) {
      console.error('No active project');
      return;
    }

    try {
      const isNew = !ticketToSave.id || ticketToSave.id === '';
      console.log('Saving ticket:', { isNew, ticket: ticketToSave });

      let savedTicket: ApiTicket;

      if (isNew) {
        // Create new ticket
        savedTicket = await ticketsApi.create({
          projectId: activeProjectId,
          title: ticketToSave.title,
          description: ticketToSave.description,
          status: ticketToSave.status,
          priority: ticketToSave.priority,
          storyPoints: ticketToSave.storyPoints,
          epicId: ticketToSave.epicId,
          assigneeId: ticketToSave.assignee,
          startDate: ticketToSave.startDate,
          endDate: ticketToSave.endDate,
        });
      } else {
        // Update existing ticket
        savedTicket = await ticketsApi.update(ticketToSave.id, {
          title: ticketToSave.title,
          description: ticketToSave.description,
          status: ticketToSave.status,
          priority: ticketToSave.priority,
          storyPoints: ticketToSave.storyPoints,
          epicId: ticketToSave.epicId,
          assigneeId: ticketToSave.assignee,
          startDate: ticketToSave.startDate,
          endDate: ticketToSave.endDate,
        });
      }

      console.log('Saved ticket:', savedTicket);

      // Refresh project details to get updated ticket list
      await loadProjectDetails(activeProjectId);
      setEditingTicket(null);
    } catch (error) {
      console.error('Failed to save ticket:', error);
      alert('Failed to save ticket. Check console for details.');
    }
  };

  const handleDeleteTicket = async (ticketId: string) => {
    if (!activeProjectId) return;

    try {
      await ticketsApi.delete(ticketId);
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
          return { ...p, tickets: p.tickets.filter(t => t.id !== ticketId) };
        }
        return p;
      }));
      
      if (editingTicket?.id === ticketId) {
        setEditingTicket(null);
      }
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const handleMoveToBoard = async (ticket: Ticket) => {
    if (!activeProjectId || !ticket.id) return;

    try {
      const updated = await ticketsApi.updateStatus(ticket.id, TicketStatus.TODO);
      
      setProjects(prev => prev.map(p => {
        if (p.id === activeProjectId) {
          return { ...p, tickets: p.tickets.map(t => t.id === ticket.id ? mapApiTicket(updated) : t) };
        }
        return p;
      }));
    } catch (error) {
      console.error('Failed to move ticket to board:', error);
    }
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicketId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = async (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (!draggedTicketId || !activeProjectId) return;

    try {
      await ticketsApi.updateStatus(draggedTicketId, status);
      await loadProjectDetails(activeProjectId);
    } catch (error) {
      console.error('Failed to drop ticket:', error);
    }

    setDraggedTicketId(null);
  };

  // --- AI Handlers ---

  const handleConsultMother = async (ticket: Ticket, epicName?: string) => {
    setModalTitle(`Analyzing Unit: ${ticket.title}`);
    setModalContent('');
    setModalOpen(true);
    setIsAiLoading(true);

    try {
      const advice = await consultMotherOnTicket(ticket, epicName);
      setModalContent(advice);
    } catch (error) {
      setModalContent('Communication error with Mother AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  const handleMotherJudgment = async () => {
    if (!activeProject) return;

    setModalTitle(`Sector Analysis: ${activeProject.name}`);
    setModalContent('');
    setModalOpen(true);
    setIsAiLoading(true);

    try {
      const judgment = await consultMotherOnProject(activeProject);
      setModalContent(judgment);
    } catch (error) {
      setModalContent('Communication error with Mother AI.');
    } finally {
      setIsAiLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-screen w-screen bg-[#020617] text-cyan-50 items-center justify-center font-mono">
        <div className="text-cyan-400">INITIALIZING SYSTEM...</div>
      </div>
    );
  }

  if (projects.length === 0) {
    return (
      <div className="flex h-screen w-screen bg-[#020617] text-cyan-50 items-center justify-center font-mono">
        <div className="text-center">
          <div className="text-cyan-400 mb-4">NO SECTORS FOUND</div>
          <Button onClick={() => handleCreateProject('New Sector')}>CREATE SECTOR</Button>
        </div>
      </div>
    );
  }

  if (!activeProject) {
    return (
      <div className="flex h-screen w-screen bg-[#020617] text-cyan-50 items-center justify-center font-mono">
        <div className="text-cyan-400">SELECT SECTOR TO PROCEED</div>
      </div>
    );
  }

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-cyan-50 overflow-hidden font-mono">
      <Sidebar 
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={setActiveProjectId}
        onCreateProject={handleCreateProject}
        onMotherJudgment={handleMotherJudgment}
        onCreateEpic={handleCreateEpic}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative">
        {/* Background Grid Effect */}
        <div className="absolute inset-0 z-0 opacity-10 pointer-events-none" 
             style={{ 
               backgroundImage: 'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)', 
               backgroundSize: '40px 40px' 
             }}>
        </div>

        {/* Header */}
        <header className="p-6 border-b border-slate-800 flex justify-between items-center z-10 bg-[#020617]/80 backdrop-blur">
          <div>
            <div className="text-[10px] text-cyan-600 uppercase tracking-[0.3em] mb-1">Current Sector</div>
            <h2 className="text-2xl font-display font-bold text-cyan-100 tracking-wide">{activeProject.name}</h2>
          </div>
          
          <div className="flex items-center gap-4">
              {/* View Toggle */}
              <div className="bg-slate-900/50 p-1 rounded-md border border-slate-700 flex gap-1">
                  <button 
                    onClick={() => setViewMode('BOARD')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2 ${viewMode === 'BOARD' ? 'bg-cyan-950/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Board View"
                  >
                      <Layout size={16} /> Board
                  </button>
                  <button 
                    onClick={() => setViewMode('TIMELINE')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2 ${viewMode === 'TIMELINE' ? 'bg-cyan-950/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Timeline View"
                  >
                      <Calendar size={16} /> Timeline
                  </button>
                  <button 
                    onClick={() => setViewMode('BACKLOG')}
                    className={`px-3 py-2 rounded text-xs font-medium transition-colors flex items-center gap-2 ${viewMode === 'BACKLOG' ? 'bg-orange-950/50 text-orange-400 shadow-sm border border-orange-500/30' : 'text-slate-500 hover:text-orange-300 hover:bg-orange-950/20'}`}
                    title="Backlog View"
                  >
                      <List size={16} /> Backlog
                  </button>
              </div>

              <Button onClick={handleCreateTicket} variant="primary">
                <Plus size={16} /> SPAWN ENTITY
              </Button>
          </div>
        </header>

        {/* Content Area */}
        {viewMode === 'BOARD' && (
             <div className="flex-1 overflow-x-auto overflow-y-hidden p-6 z-10">
                <div className="flex h-full gap-6 min-w-max">
                    {COLUMNS.map(col => (
                    <Column 
                        key={col.id}
                        status={col.id}
                        title={col.title}
                        epics={activeProject.epics}
                        tickets={activeProject.tickets.filter(t => t.status === col.id)}
                        onDrop={handleDrop}
                        onDragOver={handleDragOver}
                        onDragStart={handleDragStart}
                        onTicketClick={setEditingTicket}
                    />
                    ))}
                </div>
            </div>
        )}
        
        {viewMode === 'TIMELINE' && (
            <TimelineView 
                tickets={activeProject.tickets.filter(t => t.status !== TicketStatus.BACKLOG)}
                epics={activeProject.epics}
                onTicketClick={setEditingTicket}
            />
        )}

        {viewMode === 'BACKLOG' && (
            <BacklogView 
                tickets={activeProject.tickets.filter(t => t.status === TicketStatus.BACKLOG)}
                epics={activeProject.epics}
                onTicketClick={setEditingTicket}
                onMoveToBoard={handleMoveToBoard}
            />
        )}
       
      </main>

      <MotherModal 
        isOpen={modalOpen} 
        onClose={() => setModalOpen(false)} 
        content={modalContent}
        title={modalTitle}
        isLoading={isAiLoading}
      />

      <TicketDetailModal 
        ticket={editingTicket}
        epics={activeProject.epics}
        isOpen={!!editingTicket}
        onClose={() => setEditingTicket(null)}
        onSave={handleSaveTicket}
        onDelete={handleDeleteTicket}
        onConsultMother={handleConsultMother}
      />
    </div>
  );
}
