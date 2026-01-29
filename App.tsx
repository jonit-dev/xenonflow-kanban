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

// Initial Data
const INITIAL_PROJECTS: Project[] = [
  {
    id: 'p-1',
    name: 'Alpha Protocol',
    epics: [
        { id: 'e-1', name: 'Core Infrastructure', color: '#06b6d4' },
        { id: 'e-2', name: 'Bio-Research', color: '#10b981' }
    ],
    tickets: [
      { id: 't-1', title: 'Calibrate Sensors', description: 'Ensure bio-sensors are reading within 0.05% variance.', status: TicketStatus.TODO, priority: 'medium', storyPoints: 3, epicId: 'e-1', startDate: '2024-05-01', endDate: '2024-05-05' },
      { id: 't-2', title: 'Containment Breach Drill', description: 'Simulate sector 7 failure. Measure response times.', status: TicketStatus.DONE, priority: 'critical', storyPoints: 8, epicId: 'e-1', startDate: '2024-05-06', endDate: '2024-05-07' },
      { id: 't-4', title: 'Optimize Neural Net', description: 'Reduce latency in hive mind communication.', status: TicketStatus.BACKLOG, priority: 'high', storyPoints: 13, epicId: 'e-2' }
    ]
  },
  {
    id: 'p-2',
    name: 'Nebula Extraction',
    epics: [],
    tickets: [
      { id: 't-3', title: 'Analyze Mineral Samples', description: 'Unknown crystalline structures found in quadrant 4.', status: TicketStatus.IN_PROGRESS, priority: 'high', storyPoints: 5 }
    ]
  }
];

const COLUMNS = [
  { id: TicketStatus.TODO, title: 'PENDING' },
  { id: TicketStatus.IN_PROGRESS, title: 'ACTIVE' },
  { id: TicketStatus.REVIEW, title: 'ANALYSIS' },
  { id: TicketStatus.DONE, title: 'ARCHIVED' },
];

const EPIC_COLORS = ['#06b6d4', '#10b981', '#8b5cf6', '#f43f5e', '#f59e0b', '#ec4899'];

type ViewMode = 'BOARD' | 'TIMELINE' | 'BACKLOG';

export default function App() {
  const [projects, setProjects] = useState<Project[]>(INITIAL_PROJECTS);
  const [activeProjectId, setActiveProjectId] = useState<string>(INITIAL_PROJECTS[0].id);
  const [viewMode, setViewMode] = useState<ViewMode>('BOARD');
  
  // AI Modal State
  const [modalOpen, setModalOpen] = useState(false);
  const [modalContent, setModalContent] = useState('');
  const [modalTitle, setModalTitle] = useState('');
  const [isAiLoading, setIsAiLoading] = useState(false);

  // Ticket Edit Modal State
  const [editingTicket, setEditingTicket] = useState<Ticket | null>(null);

  // Active Project Derived State
  const activeProject = projects.find(p => p.id === activeProjectId) || projects[0];

  // Drag and Drop State
  const [draggedTicketId, setDraggedTicketId] = useState<string | null>(null);

  // --- Handlers ---

  const handleCreateProject = (name: string) => {
    const newProject: Project = {
      id: `p-${Date.now()}`,
      name,
      epics: [],
      tickets: []
    };
    setProjects([...projects, newProject]);
    setActiveProjectId(newProject.id);
  };

  const handleCreateEpic = (name: string) => {
      const newEpic: Epic = {
          id: `e-${Date.now()}`,
          name,
          color: EPIC_COLORS[activeProject.epics.length % EPIC_COLORS.length]
      };
      
      const updatedProjects = projects.map(p => {
          if (p.id === activeProjectId) {
              return { ...p, epics: [...p.epics, newEpic] };
          }
          return p;
      });
      setProjects(updatedProjects);
  }

  const handleCreateTicket = () => {
    // Determine context-based defaults
    const isTimeline = viewMode === 'TIMELINE';
    const isBacklog = viewMode === 'BACKLOG';

    // Status logic
    const initialStatus = isBacklog ? TicketStatus.BACKLOG : TicketStatus.TODO;

    // Date logic (Timeline requires dates to be visible)
    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (isTimeline) {
        const now = new Date();
        startDate = now.toISOString().split('T')[0];
        const end = new Date(now);
        end.setDate(end.getDate() + 2); // Default 2 day duration
        endDate = end.toISOString().split('T')[0];
    }

    // Create a DRAFT ticket. We DO NOT add it to the project state yet.
    // It is only added when the user clicks "SAVE" in the modal.
    const draftTicket: Ticket = {
      id: `t-${Date.now()}`,
      title: 'UNIDENTIFIED UNIT',
      description: '',
      status: initialStatus,
      priority: 'low',
      storyPoints: 0,
      startDate,
      endDate
    };

    setEditingTicket(draftTicket);
  };

  const handleSaveTicket = (ticketToSave: Ticket) => {
    const updatedProjects = projects.map(p => {
        if (p.id === activeProjectId) {
            const exists = p.tickets.some(t => t.id === ticketToSave.id);
            let newTickets;
            
            if (exists) {
                // Update existing
                newTickets = p.tickets.map(t => t.id === ticketToSave.id ? ticketToSave : t);
            } else {
                // Create new (this happens when saving the draft)
                newTickets = [...p.tickets, ticketToSave];
            }
            return { ...p, tickets: newTickets };
        }
        return p;
    });
    setProjects(updatedProjects);
  };

  const handleDeleteTicket = (ticketId: string) => {
    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        return { ...p, tickets: p.tickets.filter(t => t.id !== ticketId) };
      }
      return p;
    });
    setProjects(updatedProjects);
  };

  const handleMoveToBoard = (ticket: Ticket) => {
      // Reuse handleSaveTicket for status updates from Backlog view
      handleSaveTicket({ ...ticket, status: TicketStatus.TODO });
  };

  const handleDragStart = (e: React.DragEvent, id: string) => {
    setDraggedTicketId(id);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent, status: TicketStatus) => {
    e.preventDefault();
    if (!draggedTicketId) return;

    const updatedProjects = projects.map(p => {
      if (p.id === activeProjectId) {
        const ticket = p.tickets.find(t => t.id === draggedTicketId);
        if (ticket && ticket.status !== status) {
            const others = p.tickets.filter(t => t.id !== draggedTicketId);
            const updatedTicket = { ...ticket, status };
            return { ...p, tickets: [...others, updatedTicket] };
        }
      }
      return p;
    });

    setProjects(updatedProjects);
    setDraggedTicketId(null);
  };

  // --- AI Handlers ---

  const handleConsultMother = async (ticket: Ticket, epicName?: string) => {
    setModalTitle(`Analyzing Unit: ${ticket.title}`);
    setModalContent('');
    setModalOpen(true);
    setIsAiLoading(true);

    const advice = await consultMotherOnTicket(ticket, epicName);
    
    setModalContent(advice);
    setIsAiLoading(false);
  };

  const handleMotherJudgment = async () => {
    setModalTitle(`Sector Analysis: ${activeProject.name}`);
    setModalContent('');
    setModalOpen(true);
    setIsAiLoading(true);

    const judgment = await consultMotherOnProject(activeProject);

    setModalContent(judgment);
    setIsAiLoading(false);
  };

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
                    className={`p-2 rounded text-xs transition-colors flex items-center gap-2 ${viewMode === 'BOARD' ? 'bg-cyan-950/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Board View"
                  >
                      <Layout size={16} /> 
                  </button>
                  <button 
                    onClick={() => setViewMode('TIMELINE')}
                    className={`p-2 rounded text-xs transition-colors flex items-center gap-2 ${viewMode === 'TIMELINE' ? 'bg-cyan-950/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Timeline View"
                  >
                      <Calendar size={16} /> 
                  </button>
                  <button 
                    onClick={() => setViewMode('BACKLOG')}
                    className={`p-2 rounded text-xs transition-colors flex items-center gap-2 ${viewMode === 'BACKLOG' ? 'bg-cyan-950/50 text-cyan-400 shadow-sm' : 'text-slate-500 hover:text-slate-300'}`}
                    title="Backlog View"
                  >
                      <List size={16} /> 
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
