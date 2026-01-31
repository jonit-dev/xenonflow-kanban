import { Activity, AlertTriangle, Hash, Hexagon, Plus, Trash2, X } from 'lucide-react';
import React, { useState } from 'react';
import { Project } from '../types';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onDeleteProject: (id: string) => void;
  onMotherJudgment: () => void;
  onCreateEpic: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  projects,
  activeProjectId,
  onSelectProject,
  onCreateProject,
  onDeleteProject,
  onMotherJudgment,
  onCreateEpic
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');

  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [newEpicName, setNewEpicName] = useState('');

  const [deleteConfirmProject, setDeleteConfirmProject] = useState<Project | null>(null);
  const [deleteConfirmName, setDeleteConfirmName] = useState('');

  const activeProject = projects.find(p => p.id === activeProjectId);

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (newProjectName.trim()) {
      onCreateProject(newProjectName);
      setNewProjectName('');
      setIsCreatingProject(false);
    }
  };

  const handleCreateEpic = (e: React.FormEvent) => {
    e.preventDefault();
    if (newEpicName.trim()) {
      onCreateEpic(newEpicName);
      setNewEpicName('');
      setIsCreatingEpic(false);
    }
  }

  const handleDeleteConfirm = (e: React.FormEvent) => {
    e.preventDefault();
    if (deleteConfirmProject && deleteConfirmName === deleteConfirmProject.name) {
      onDeleteProject(deleteConfirmProject.id);
      setDeleteConfirmProject(null);
      setDeleteConfirmName('');
    }
  }

  const isDeleteConfirmValid = deleteConfirmProject && deleteConfirmName === deleteConfirmProject.name;

  // Calculate Progress
  const totalPoints = activeProject?.tickets.reduce((sum, t) => sum + (t.effort || 0), 0) || 0;
  const donePoints = activeProject?.tickets
    .filter(t => t.status === 'DONE')
    .reduce((sum, t) => sum + (t.effort || 0), 0) || 0;

  const progressPercent = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;

  return (
    <div className="w-64 bg-slate-950/40 backdrop-blur-xl border-r border-cyan-900/30 flex flex-col h-full shrink-0 z-20 font-mono">
      <div className="p-6 border-b border-cyan-900/30 bg-slate-950/20 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl -mr-12 -mt-12 animate-pulse"></div>
        <h1 className="text-xl font-bold text-cyan-400 tracking-tighter flex items-center gap-2 text-glow">
          <Hexagon className="fill-cyan-950 animate-pulse" />
          XENON<span className="text-slate-500 font-light">FLOW</span>
        </h1>
        <p className="text-[9px] text-cyan-600/60 mt-1 tracking-[0.3em] font-bold uppercase">Hive Mind Protocol // v9.3</p>
      </div>

      <div className="flex-1 overflow-y-auto space-y-6 py-4 custom-scrollbar">

        {/* Project Progress Section */}
        {activeProject && (
          <div className="px-4">
            <div className="p-4 rounded-lg bg-cyan-950/10 border border-cyan-900/20">
              <div className="flex justify-between items-end mb-2">
                <span className="text-[10px] text-cyan-500 font-black uppercase tracking-widest">Sector Status</span>
                <span className="text-[10px] text-cyan-300 font-mono text-glow">{Math.round(progressPercent)}%</span>
              </div>
              <div className="w-full h-1 bg-slate-900 rounded-full overflow-hidden">
                <div
                  className="h-full bg-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.8)] transition-all duration-1000 ease-out"
                  style={{ width: `${progressPercent}%` }}
                ></div>
              </div>
              <div className="mt-3 flex gap-4 text-[9px] text-cyan-700 font-bold uppercase tracking-wider">
                <span className="flex items-center gap-1"><Hash size={10} /> {totalPoints} UNITS</span>
                <span className="flex items-center gap-1 text-emerald-500/70"><Activity size={10} /> {donePoints} ARCHIVED</span>
              </div>
            </div>
          </div>
        )}

        {/* Sectors List */}
        <div className="px-4">
          <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
            <div className="w-1 h-3 bg-cyan-600"></div> Sectors
          </h3>
          <div className="space-y-1">
            {projects.map(project => (
              <div key={project.id} className={`flex items-center gap-1 group ${activeProjectId === project.id ? '' : 'hover:bg-slate-900/30 rounded-md'}`}>
                <button
                  onClick={() => onSelectProject(project.id)}
                  className={`flex-1 text-left px-4 py-2.5 text-[11px] font-bold tracking-wider uppercase rounded-md transition-all border flex items-center justify-between ${activeProjectId === project.id
                      ? 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30 text-glow shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                      : 'text-slate-500 border-transparent hover:text-cyan-400'
                    }`}
                >
                  <span className="truncate">{project.name}</span>
                  {activeProjectId === project.id && <div className="w-1 h-1 bg-cyan-400 rounded-full animate-ping"></div>}
                </button>
                {activeProjectId !== project.id && (
                  <button
                    onClick={() => setDeleteConfirmProject(project)}
                    className="p-2 text-slate-700 hover:text-rose-500 hover:bg-rose-950/20 rounded-md transition-all opacity-0 group-hover:opacity-100"
                    title="Terminate Sector"
                  >
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
            ))}
          </div>

          {isCreatingProject ? (
            <form onSubmit={handleCreate} className="mt-2 p-3 bg-slate-900/50 border border-cyan-500/30 rounded-md">
              <input
                autoFocus
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="SECTOR DESIGNATION..."
                className="w-full bg-black/40 border border-cyan-900/50 text-cyan-100 text-[10px] p-2 focus:outline-none focus:border-cyan-500 mb-2 placeholder:text-slate-700 font-mono"
              />
              <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-cyan-900/50 text-cyan-400 text-[10px] py-1.5 hover:bg-cyan-800/50 uppercase font-black tracking-widest">Init</button>
                <button type="button" onClick={() => setIsCreatingProject(false)} className="flex-1 bg-slate-800 text-slate-500 text-[10px] py-1.5 hover:bg-slate-700 uppercase font-black tracking-widest">Abort</button>
              </div>
            </form>
          ) : (
            <button
              onClick={() => setIsCreatingProject(true)}
              className="w-full mt-2 border border-dashed border-slate-800 text-slate-600 hover:text-cyan-500 hover:border-cyan-900/50 p-3 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all group rounded-md"
            >
              <Plus size={14} className="group-hover:rotate-90 transition-transform" /> SPAWN SECTOR
            </button>
          )}
        </div>

        {/* Epics List */}
        {activeProject && (
          <div className="px-4">
            <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] mb-4 flex items-center gap-2">
              <div className="w-1 h-3 bg-purple-600"></div> Protocols
            </h3>
            <div className="space-y-1 mb-4">
              {activeProject.epics.map(epic => (
                <div key={epic.id} className="flex items-center justify-between gap-2 px-4 py-2 text-[10px] font-bold text-slate-400 border border-slate-900 bg-slate-900/20 rounded-md">
                  <span className="truncate uppercase tracking-widest">{epic.name}</span>
                  <div className="w-1.5 h-1.5 rounded-sm" style={{ backgroundColor: epic.color, boxShadow: `0 0 5px ${epic.color}` }}></div>
                </div>
              ))}
              {activeProject.epics.length === 0 && (
                <div className="text-[10px] text-slate-700 px-4 italic font-bold">NO ACTIVE PROTOCOLS</div>
              )}
            </div>

            {isCreatingEpic ? (
              <form onSubmit={handleCreateEpic} className="p-3 bg-slate-900/50 border border-purple-500/30 rounded-md">
                <input
                  autoFocus
                  type="text"
                  value={newEpicName}
                  onChange={(e) => setNewEpicName(e.target.value)}
                  placeholder="PROTOCOL ID..."
                  className="w-full bg-black/40 border border-purple-900/50 text-purple-100 text-[10px] p-2 focus:outline-none focus:border-purple-500 mb-2 placeholder:text-slate-700 font-mono"
                />
                <div className="flex gap-2">
                  <button type="submit" className="flex-1 bg-purple-900/50 text-purple-400 text-[10px] py-1.5 hover:bg-purple-800/50 font-black tracking-widest">RECORD</button>
                  <button type="button" onClick={() => setIsCreatingEpic(false)} className="flex-1 bg-slate-800 text-slate-500 text-[10px] py-1.5 hover:bg-slate-700 font-black tracking-widest">STOP</button>
                </div>
              </form>
            ) : (
              <button
                onClick={() => setIsCreatingEpic(true)}
                className="w-full border border-dashed border-slate-800 text-slate-600 hover:text-purple-500 hover:border-purple-900/50 p-3 text-[10px] font-black tracking-widest flex items-center justify-center gap-2 transition-all rounded-md"
              >
                <Plus size={14} /> NEW PROTOCOL
              </button>
            )}
          </div>
        )}

      </div>

      <div className="p-4 border-t border-cyan-900/30 bg-slate-950/40">
        <button
          onClick={onMotherJudgment}
          className="w-full mother-btn py-4 rounded-md flex flex-col items-center justify-center gap-1 alien-glow-hover group"
        >
          <div className="flex items-center gap-2">
            <Activity size={14} className="text-cyan-400 animate-pulse" />
            <span className="text-[11px] font-black tracking-[0.2em]">CONSULT MOTHER</span>
          </div>
          <span className="text-[8px] text-cyan-600 group-hover:text-cyan-400 transition-colors uppercase font-bold tracking-widest">Direct Interface Link</span>
        </button>
      </div>

      {/* Delete Confirmation Modal */}
      {deleteConfirmProject && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={() => {
              setDeleteConfirmProject(null);
              setDeleteConfirmName('');
            }}
          />
          <div className="relative w-full max-w-md bg-slate-900/40 backdrop-blur-2xl border border-rose-500/30 shadow-[0_0_80px_rgba(244,63,94,0.15)] rounded-lg font-mono">
            {/* Header */}
            <div className="p-6 border-b border-rose-500/20 bg-rose-950/20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-rose-500/20 rounded-md">
                  <AlertTriangle className="text-rose-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-rose-100">Sector Termination</h2>
                  <p className="text-[10px] text-rose-800 uppercase font-black tracking-widest mt-1">
                    IRREVERSIBLE ACTION
                  </p>
                </div>
              </div>
              <button
                onClick={() => {
                  setDeleteConfirmProject(null);
                  setDeleteConfirmName('');
                }}
                className="text-slate-500 hover:text-rose-400 p-2 hover:bg-rose-500/10 rounded-md transition-all"
              >
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-6">
              <div className="bg-rose-950/20 border border-rose-500/30 rounded-md p-4">
                <p className="text-[10px] text-rose-300 uppercase font-bold tracking-wider mb-2">
                  WARNING: COMPLETE DATA LOSS
                </p>
                <p className="text-[11px] text-rose-200/70">
                  All tickets, epics, and columns within <span className="text-rose-400 font-bold">{deleteConfirmProject.name}</span> will be permanently annihilated. This action cannot be undone.
                </p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-rose-700 font-black flex items-center gap-2">
                  <AlertTriangle size={12} /> Confirm Sector Designation
                </label>
                <input
                  autoFocus
                  type="text"
                  value={deleteConfirmName}
                  onChange={(e) => setDeleteConfirmName(e.target.value)}
                  placeholder={`Type "${deleteConfirmProject.name}" to confirm...`}
                  className="w-full bg-black/40 border border-rose-900/30 text-rose-100 p-4 focus:border-rose-500 focus:outline-none font-bold text-lg uppercase tracking-wider rounded-md placeholder:text-rose-900/50"
                />
                <p className="text-[9px] text-rose-700/60 uppercase tracking-wider">
                  Enter the exact sector name to enable termination
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-rose-500/20 bg-slate-950/40 flex justify-end gap-3">
              <button
                onClick={() => {
                  setDeleteConfirmProject(null);
                  setDeleteConfirmName('');
                }}
                className="px-6 py-2 text-[10px] font-black text-slate-400 border border-slate-700 hover:text-slate-200 hover:border-slate-500 uppercase tracking-widest rounded-md transition-all"
              >
                Abort
              </button>
              <button
                onClick={handleDeleteConfirm}
                disabled={!isDeleteConfirmValid}
                className={`px-6 py-2 text-[10px] font-black uppercase tracking-widest rounded-md transition-all flex items-center gap-2 ${
                  isDeleteConfirmValid
                    ? 'bg-rose-600 text-white hover:bg-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                    : 'bg-slate-800 text-slate-600 cursor-not-allowed opacity-50'
                }`}
              >
                <Trash2 size={14} /> Terminate Sector
              </button>
            </div>

            {/* Corner Decorative Orbs */}
            <div className="absolute top-2 left-2 w-1 h-1 bg-rose-500/60 rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-rose-500/60 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-rose-500/60 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-rose-500/60 rounded-full"></div>
          </div>
        </div>
      )}
    </div>
  );
};
