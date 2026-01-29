import React, { useState } from 'react';
import { Project, Epic } from '../types';
import { Plus, Hexagon, ChevronRight, Activity, Layers, Hash } from 'lucide-react';

interface SidebarProps {
  projects: Project[];
  activeProjectId: string;
  onSelectProject: (id: string) => void;
  onCreateProject: (name: string) => void;
  onMotherJudgment: () => void;
  onCreateEpic: (name: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ 
  projects, 
  activeProjectId, 
  onSelectProject, 
  onCreateProject,
  onMotherJudgment,
  onCreateEpic
}) => {
  const [isCreatingProject, setIsCreatingProject] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  
  const [isCreatingEpic, setIsCreatingEpic] = useState(false);
  const [newEpicName, setNewEpicName] = useState('');

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

  // Calculate Progress
  const totalPoints = activeProject?.tickets.reduce((sum, t) => sum + (t.storyPoints || 0), 0) || 0;
  const donePoints = activeProject?.tickets
    .filter(t => t.status === 'DONE')
    .reduce((sum, t) => sum + (t.storyPoints || 0), 0) || 0;
  
  const progressPercent = totalPoints > 0 ? (donePoints / totalPoints) * 100 : 0;

  return (
    <div className="w-64 bg-slate-950 border-r border-slate-800 flex flex-col h-full shrink-0">
      <div className="p-6 border-b border-slate-800 bg-slate-950 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-20 h-20 bg-cyan-500/10 rounded-full blur-xl -mr-10 -mt-10 animate-pulse"></div>
        <h1 className="text-xl font-bold text-cyan-400 tracking-tighter flex items-center gap-2">
            <Hexagon className="fill-cyan-950" />
            XENON<span className="text-slate-500">FLOW</span>
        </h1>
        <p className="text-[10px] text-slate-500 mt-1 tracking-widest">HIVE MIND PROTOCOL v9.3</p>
      </div>

      <div className="flex-1 overflow-y-auto">
        
        {/* Project Progress Section */}
        {activeProject && (
            <div className="p-4 border-b border-slate-800/50">
                <div className="flex justify-between items-end mb-1">
                    <span className="text-[10px] text-cyan-500 font-bold uppercase tracking-widest">Sector Completion</span>
                    <span className="text-[10px] text-slate-400 font-mono">{Math.round(progressPercent)}%</span>
                </div>
                <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                    <div 
                        className="h-full bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,0.5)] transition-all duration-500 ease-out"
                        style={{ width: `${progressPercent}%` }}
                    ></div>
                </div>
                <div className="mt-2 flex gap-4 text-[10px] text-slate-500 font-mono">
                     <span className="flex items-center gap-1"><Hash size={10}/> {totalPoints} TOT</span>
                     <span className="flex items-center gap-1 text-emerald-500/70"><Activity size={10}/> {donePoints} CMP</span>
                </div>
            </div>
        )}

        {/* Sectors List */}
        <div className="p-4">
          <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2">Sectors</h3>
          <div className="space-y-1">
            {projects.map(project => (
              <button
                key={project.id}
                onClick={() => onSelectProject(project.id)}
                className={`w-full text-left px-3 py-2 text-xs font-medium rounded-sm flex items-center justify-between group transition-all ${
                  activeProjectId === project.id 
                    ? 'bg-cyan-950/30 text-cyan-300 border-l-2 border-cyan-500' 
                    : 'text-slate-400 hover:bg-slate-900 hover:text-cyan-200 border-l-2 border-transparent'
                }`}
              >
                <span className="truncate">{project.name}</span>
                {activeProjectId === project.id && <ChevronRight size={12} className="animate-pulse"/>}
              </button>
            ))}
          </div>

            {isCreatingProject ? (
            <form onSubmit={handleCreate} className="mt-2 animate-in slide-in-from-left duration-200">
                <input
                autoFocus
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                placeholder="SECTOR NAME..."
                className="w-full bg-slate-900 border border-cyan-500/50 text-cyan-100 text-xs p-2 focus:outline-none focus:ring-1 focus:ring-cyan-500 mb-2 placeholder:text-slate-600"
                />
                <div className="flex gap-2">
                <button type="submit" className="flex-1 bg-cyan-900/50 text-cyan-400 text-xs py-1 hover:bg-cyan-800/50">INIT</button>
                <button type="button" onClick={() => setIsCreatingProject(false)} className="flex-1 bg-slate-800 text-slate-400 text-xs py-1 hover:bg-slate-700">ABORT</button>
                </div>
            </form>
            ) : (
            <button 
                onClick={() => setIsCreatingProject(true)}
                className="w-full mt-2 border border-dashed border-slate-700 text-slate-500 hover:text-cyan-400 hover:border-cyan-500/50 p-2 text-xs flex items-center justify-center gap-2 transition-all group"
            >
                <Plus size={14} className="group-hover:rotate-90 transition-transform"/> NEW SECTOR
            </button>
            )}
        </div>

        {/* Epics List */}
        {activeProject && (
            <div className="p-4 border-t border-slate-800/50">
                <h3 className="text-xs font-bold text-slate-500 uppercase tracking-widest mb-3 pl-2 flex items-center gap-2">
                    <Layers size={12} /> Protocols (Epics)
                </h3>
                <div className="space-y-1 mb-2">
                    {activeProject.epics.map(epic => (
                        <div key={epic.id} className="flex items-center gap-2 px-3 py-1.5 text-xs text-slate-400">
                            <div className="w-2 h-2 rounded-full" style={{ backgroundColor: epic.color }}></div>
                            <span className="truncate">{epic.name}</span>
                        </div>
                    ))}
                    {activeProject.epics.length === 0 && (
                        <div className="text-[10px] text-slate-600 px-3 italic">No protocols defined.</div>
                    )}
                </div>

                 {isCreatingEpic ? (
                    <form onSubmit={handleCreateEpic} className="animate-in slide-in-from-left duration-200">
                        <input
                        autoFocus
                        type="text"
                        value={newEpicName}
                        onChange={(e) => setNewEpicName(e.target.value)}
                        placeholder="PROTOCOL NAME..."
                        className="w-full bg-slate-900 border border-purple-500/50 text-purple-100 text-xs p-2 focus:outline-none focus:ring-1 focus:ring-purple-500 mb-2 placeholder:text-slate-600"
                        />
                        <div className="flex gap-2">
                        <button type="submit" className="flex-1 bg-purple-900/50 text-purple-400 text-xs py-1 hover:bg-purple-800/50">SAVE</button>
                        <button type="button" onClick={() => setIsCreatingEpic(false)} className="flex-1 bg-slate-800 text-slate-400 text-xs py-1 hover:bg-slate-700">X</button>
                        </div>
                    </form>
                    ) : (
                    <button 
                        onClick={() => setIsCreatingEpic(true)}
                        className="w-full border border-dashed border-slate-700 text-slate-500 hover:text-purple-400 hover:border-purple-500/50 p-2 text-xs flex items-center justify-center gap-2 transition-all"
                    >
                        <Plus size={12} /> ADD PROTOCOL
                    </button>
                )}
            </div>
        )}

      </div>

      <div className="p-4 border-t border-slate-800 bg-slate-950/50">
        <button 
            onClick={onMotherJudgment}
            className="w-full bg-gradient-to-r from-purple-900/20 to-cyan-900/20 border border-slate-700 hover:border-cyan-500/50 text-slate-300 hover:text-cyan-200 text-xs py-3 px-2 flex items-center justify-center gap-2 transition-all alien-glow-hover"
        >
            <Activity size={14} className="text-purple-400" />
            <span>MOTHER'S JUDGMENT</span>
        </button>
      </div>
    </div>
  );
};
