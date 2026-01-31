import { AnimatePresence, motion } from 'framer-motion';
import { Calendar, Layout, List, Plus, Terminal } from 'lucide-react';
import React, { Suspense, useEffect } from 'react';
import { Background3D } from './components/Background3D';
import { BacklogView } from './components/BacklogView';
import { Column } from './components/BoardComponents';
import { MotherModal } from './components/MotherModal';
import { Sidebar } from './components/Sidebar';
import { TicketDetailModal } from './components/TicketDetailModal';
import { TimelineView } from './components/TimelineView';
import { Button } from './components/ui/Button';
import { consultMotherOnProject, consultMotherOnTicket } from './services/geminiService';
import { TicketStatus } from './types';
import {
  useActiveProjectData,
  useCloseTicketModal,
  useCloseMotherModal,
  useIsAppLoading,
  useLoadProjects,
  useLoadProjectDetails,
  useIsMotherModalOpen,
  useMotherModalContent,
  useMotherModalTitle,
  useIsMotherLoading,
  useOpenMotherModal,
  useOpenTicketModal,
  useProjectsList,
  useSaveTicket,
  useSetMotherModalContent,
  useSetMotherModalLoading,
  useSetViewMode,
  useSetDraggedTicketId,
  useDraggedTicketId,
  useIsTicketModalOpen,
  useTicketModalId,
  useDraftTicket,
  useUpdateTicketStatus,
  useViewModeState,
  useDeleteTicket,
  useCreateTicket,
  useCreateEpic,
  useCreateProject,
  useUpdateColumn,
  useDeleteColumn,
  useCreateColumn,
  useMoveTicketToBoard,
  useSetActiveProject,
} from './hooks/useStore';

export default function App() {
  // Data from store
  const projects = useProjectsList();
  const activeProject = useActiveProjectData();
  const isLoading = useIsAppLoading();
  const viewMode = useViewModeState();

  // UI actions
  const setViewMode = useSetViewMode();
  const setDraggedTicketId = useSetDraggedTicketId();
  const draggedTicketId = useDraggedTicketId();
  const setActiveProject = useSetActiveProject();

  // Modal state
  const isTicketModalOpen = useIsTicketModalOpen();
  const ticketId = useTicketModalId();
  const draftTicket = useDraftTicket();
  const isMotherModalOpen = useIsMotherModalOpen();
  const motherContent = useMotherModalContent();
  const motherTitle = useMotherModalTitle();
  const isMotherLoading = useIsMotherLoading();

  // Modal actions
  const openTicketModal = useOpenTicketModal();
  const closeTicketModal = useCloseTicketModal();
  const closeMotherModal = useCloseMotherModal();
  const openMotherModal = useOpenMotherModal();
  const setMotherModalContent = useSetMotherModalContent();
  const setMotherModalLoading = useSetMotherModalLoading();

  // Data actions
  const loadProjects = useLoadProjects();
  const loadProjectDetails = useLoadProjectDetails();
  const saveTicket = useSaveTicket();
  const deleteTicket = useDeleteTicket();
  const updateTicketStatus = useUpdateTicketStatus();
  const createTicket = useCreateTicket();
  const createEpic = useCreateEpic();
  const createProject = useCreateProject();
  const updateColumn = useUpdateColumn();
  const deleteColumn = useDeleteColumn();
  const createColumn = useCreateColumn();

  // Initialize app
  useEffect(() => {
    loadProjects();

    // Test API connectivity
    fetch('http://localhost:3333/health')
      .then((r) => r.json())
      .then((d) => console.log('API health check:', d))
      .catch((e) => console.error('API health check failed:', e));
  }, []);

  // --- Handlers ---

  const handleCreateTicket = () => {
    const isTimeline = viewMode === 'TIMELINE';

    let startDate: string | undefined = undefined;
    let endDate: string | undefined = undefined;

    if (isTimeline) {
      const now = new Date();
      startDate = now.toISOString().split('T')[0];
      const end = new Date(now);
      end.setDate(end.getDate() + 2);
      endDate = end.toISOString().split('T')[0];
    }

    createTicket(TicketStatus.BACKLOG, startDate, endDate);
  };

  const handleConsultMother = async (ticketId: string, epicName?: string) => {
    const ticket = activeProject?.tickets.find((t) => t.id === ticketId);
    if (!ticket) return;

    openMotherModal(`Analyzing Unit: ${ticket.title}`);

    try {
      const advice = await consultMotherOnTicket(ticket, epicName);
      setMotherModalContent(advice);
    } catch (error) {
      setMotherModalContent('Communication error with Mother AI.');
    } finally {
      setMotherModalLoading(false);
    }
  };

  const handleMotherJudgment = async () => {
    if (!activeProject) return;

    openMotherModal(`Sector Analysis: ${activeProject.name}`);

    try {
      const judgment = await consultMotherOnProject(activeProject);
      setMotherModalContent(judgment);
    } catch (error) {
      setMotherModalContent('Communication error with Mother AI.');
    } finally {
      setMotherModalLoading(false);
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
    if (!draggedTicketId) return;

    await updateTicketStatus(draggedTicketId, status);
    setDraggedTicketId(null);
  };

  // --- Render ---

  if (isLoading) {
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
          <Button onClick={() => createProject('New Sector')}>CREATE SECTOR</Button>
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

  // Get the ticket to display in modal (either draft or from project)
  const modalTicket = draftTicket || activeProject.tickets.find((t) => t.id === ticketId) || null;

  return (
    <div className="flex h-screen w-screen bg-[#020617] text-cyan-50 overflow-hidden font-mono relative">
      <div className="scanlines"></div>

      <Suspense fallback={null}>
        <Background3D />
      </Suspense>

      <Sidebar
        projects={projects}
        activeProjectId={activeProject.id}
        onSelectProject={async (id) => {
          setActiveProject(id);
          await loadProjectDetails(id);
        }}
        onCreateProject={createProject}
        onMotherJudgment={handleMotherJudgment}
        onCreateEpic={createEpic}
      />

      <main className="flex-1 flex flex-col h-full overflow-hidden relative z-10 crt-screen">
        {/* Background Grid Effect */}
        <div
          className="absolute inset-0 z-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage:
              'linear-gradient(rgba(6,182,212,0.1) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.1) 1px, transparent 1px)',
            backgroundSize: '80px 80px',
          }}
        ></div>

        {/* Header */}
        <header className="p-6 border-b border-cyan-900/30 flex justify-between items-center z-10 bg-slate-950/20 backdrop-blur-md">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-cyan-950/30 border border-cyan-500/30 rounded-lg">
              <Terminal className="text-cyan-400 animate-pulse" size={24} />
            </div>
            <div>
              <div className="text-[10px] text-cyan-500 uppercase tracking-[0.4em] mb-1 font-bold">
                System Sector // Active
              </div>
              <h2 className="text-2xl font-display font-bold text-cyan-100 tracking-wider text-glow">
                {activeProject.name}
              </h2>
              {activeProject.description && (
                <div className="text-[10px] text-cyan-700 uppercase tracking-[0.2em] font-bold mt-1 max-w-xl">
                  {activeProject.description}
                </div>
              )}
            </div>
          </div>

          <div className="flex items-center gap-4">
            {/* View Toggle */}
            <div className="bg-slate-900/40 p-1 rounded-lg border border-cyan-900/30 flex gap-1 backdrop-blur">
              <button
                onClick={() => setViewMode('BOARD')}
                className={`px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'BOARD'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30'
                    : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/20'
                }`}
                title="Board View"
              >
                <Layout size={14} /> Board
              </button>
              <button
                onClick={() => setViewMode('TIMELINE')}
                className={`px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'TIMELINE'
                    ? 'bg-cyan-500/20 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)] border border-cyan-500/30'
                    : 'text-slate-500 hover:text-cyan-400 hover:bg-cyan-950/20'
                }`}
                title="Timeline View"
              >
                <Calendar size={14} /> Timeline
              </button>
              <button
                onClick={() => setViewMode('BACKLOG')}
                className={`px-4 py-2 rounded-md text-[10px] uppercase tracking-widest font-bold transition-all flex items-center gap-2 ${
                  viewMode === 'BACKLOG'
                    ? 'bg-orange-500/20 text-orange-400 shadow-[0_0_15px_rgba(245,158,11,0.2)] border border-orange-500/30'
                    : 'text-slate-500 hover:text-orange-400 hover:bg-orange-950/20'
                }`}
                title="Backlog View"
              >
                <List size={14} /> Backlog
              </button>
            </div>

            <Button onClick={handleCreateTicket} className="mother-btn px-6 font-bold py-2 rounded-md">
              <Plus size={16} /> SPAWN ENTITY
            </Button>
          </div>
        </header>

        <div className="flex-1 overflow-hidden relative">
          <AnimatePresence mode="wait">
            {viewMode === 'BOARD' && (
              <motion.div
                key="board"
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -20 }}
                className="absolute inset-0 overflow-x-auto overflow-y-hidden p-6"
              >
                <div className="flex h-full gap-6 min-w-max">
                  {activeProject.columns.map((col) => (
                    <Column
                      key={col.id}
                      id={col.id}
                      status={col.statusKey as TicketStatus}
                      title={col.title}
                      epics={activeProject.epics}
                      tickets={activeProject.tickets.filter((t) => t.status === col.statusKey)}
                      onDrop={handleDrop}
                      onDragOver={handleDragOver}
                      onDragStart={handleDragStart}
                      onTicketClick={(ticket) => openTicketModal(ticket.id)}
                      onRename={updateColumn}
                      onDelete={deleteColumn}
                    />
                  ))}
                </div>
              </motion.div>
            )}

            {viewMode === 'TIMELINE' && (
              <motion.div
                key="timeline"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 1.05 }}
                className="absolute inset-0"
              >
                <TimelineView
                  tickets={activeProject.tickets.filter((t) => t.status !== TicketStatus.BACKLOG)}
                  epics={activeProject.epics}
                  onTicketClick={(ticket) => openTicketModal(ticket.id)}
                />
              </motion.div>
            )}

            {viewMode === 'BACKLOG' && (
              <motion.div
                key="backlog"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="absolute inset-0"
              >
                <BacklogView
                  tickets={activeProject.tickets.filter((t) => t.status === TicketStatus.BACKLOG)}
                  epics={activeProject.epics}
                  onTicketClick={(ticket) => openTicketModal(ticket.id)}
                  onMoveToBoard={useMoveTicketToBoard()}
                />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </main>

      <MotherModal
        isOpen={isMotherModalOpen}
        onClose={closeMotherModal}
        content={motherContent}
        title={motherTitle}
        isLoading={isMotherLoading}
      />

      <TicketDetailModal
        ticket={modalTicket}
        epics={activeProject.epics}
        isOpen={isTicketModalOpen}
        onClose={closeTicketModal}
        onSave={saveTicket}
        onDelete={deleteTicket}
        onConsultMother={(ticket, epicName) => handleConsultMother(ticket.id, epicName)}
      />
    </div>
  );
}
