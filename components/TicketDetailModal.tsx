import { AnimatePresence, motion } from 'framer-motion';
import { Archive, BrainCircuit, Calendar, Cpu, Database, Flag, Layers, Save, Trash2, User, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Epic, Ticket, TicketStatus } from '../types';
import { Button } from './ui/Button';

interface TicketDetailModalProps {
  ticket: Ticket | null;
  epics: Epic[];
  isOpen: boolean;
  onClose: () => void;
  onSave: (updatedTicket: Ticket) => void;
  onDelete: (id: string) => void;
  onConsultMother: (ticket: Ticket, epicName?: string) => void;
}

export const TicketDetailModal: React.FC<TicketDetailModalProps> = ({
  ticket,
  epics,
  isOpen,
  onClose,
  onSave,
  onDelete,
  onConsultMother
}) => {
  const [editedTicket, setEditedTicket] = useState<Ticket | null>(null);

  useEffect(() => {
    setEditedTicket(ticket);
  }, [ticket]);

  if (!editedTicket) return null;

  const handleChange = (field: keyof Ticket, value: any) => {
    setEditedTicket(prev => prev ? { ...prev, [field]: value } : null);
  };

  const currentEpic = epics.find(e => e.id === editedTicket.epicId);

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-900/40 backdrop-blur-2xl border border-cyan-500/30 shadow-[0_0_80px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] overflow-hidden rounded-lg font-mono"
          >
            {/* Header */}
            <div className="p-6 border-b border-cyan-500/20 bg-cyan-950/20 flex justify-between items-center">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-500/20 rounded-md">
                  <Cpu className="text-cyan-400 animate-pulse" size={24} />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-cyan-100 text-glow">Unit Data Terminal</h2>
                  <p className="text-[10px] text-cyan-800 uppercase font-black tracking-widest mt-1">Status: Online // Sector Access Granted</p>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-cyan-400 p-2 hover:bg-cyan-500/10 rounded-md transition-all">
                <X size={24} />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 overflow-y-auto space-y-8 custom-scrollbar">

              {/* Title Input */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black flex items-center gap-2">
                  <Database size={12} /> Unit Identifier
                </label>
                <input
                  type="text"
                  value={editedTicket.title}
                  onChange={(e) => handleChange('title', e.target.value)}
                  className="w-full bg-black/40 border border-cyan-900/30 text-cyan-100 p-4 focus:border-cyan-500 focus:outline-none font-bold text-lg uppercase tracking-wider rounded-md"
                />
              </div>

              {/* Row 1: Status, Priority, Points, Epic */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {/* Status */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black">Status</label>
                  <select
                    value={editedTicket.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-900/30 text-cyan-300 p-3 text-[10px] font-black tracking-widest focus:border-cyan-500 focus:outline-none rounded-md appearance-none uppercase"
                  >
                    {Object.values(TicketStatus).map(s => (
                      <option key={s} value={s} className="bg-slate-900">{s}</option>
                    ))}
                  </select>
                </div>

                {/* Priority */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black">Priority</label>
                  <select
                    value={editedTicket.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-900/30 text-cyan-300 p-3 text-[10px] font-black tracking-widest focus:border-cyan-500 focus:outline-none rounded-md appearance-none uppercase"
                  >
                    <option value="low" className="bg-slate-900">LOW</option>
                    <option value="medium" className="bg-slate-900">MEDIUM</option>
                    <option value="high" className="bg-slate-900">HIGH</option>
                    <option value="critical" className="bg-slate-900 text-rose-500">CRITICAL</option>
                  </select>
                </div>

                {/* Story Points */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black">Complexity</label>
                  <input
                    type="number"
                    min="0"
                    value={editedTicket.storyPoints}
                    onChange={(e) => handleChange('storyPoints', parseInt(e.target.value) || 0)}
                    className="w-full bg-black/40 border border-cyan-900/30 text-cyan-300 p-3 text-[11px] font-black focus:border-cyan-500 focus:outline-none rounded-md"
                  />
                </div>

                {/* Epic */}
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black">Protocol</label>
                  <div className="relative">
                    <select
                      value={editedTicket.epicId || ''}
                      onChange={(e) => handleChange('epicId', e.target.value || undefined)}
                      className="w-full bg-black/40 border border-cyan-900/30 text-cyan-300 p-3 text-[10px] font-black tracking-widest focus:border-cyan-500 focus:outline-none appearance-none rounded-md uppercase"
                    >
                      <option value="" className="bg-slate-900">UNASSIGNED</option>
                      {epics.map(epic => (
                        <option key={epic.id} value={epic.id} className="bg-slate-900">{epic.name}</option>
                      ))}
                    </select>
                    <Layers className="absolute right-3 top-3 text-cyan-900 pointer-events-none" size={14} />
                  </div>
                </div>
              </div>

              {/* Row 2: Dates */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black flex items-center gap-2">
                    <Calendar size={12} /> Activation Date
                  </label>
                  <input
                    type="date"
                    value={editedTicket.startDate || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-900/30 text-cyan-500 p-3 text-[10px] font-black focus:border-cyan-500 focus:outline-none rounded-md uppercase"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black flex items-center gap-2">
                    <Calendar size={12} /> Archival Goal
                  </label>
                  <input
                    type="date"
                    value={editedTicket.endDate || ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full bg-black/40 border border-cyan-900/30 text-cyan-500 p-3 text-[10px] font-black focus:border-cyan-500 focus:outline-none rounded-md uppercase"
                  />
                </div>
              </div>

              {/* Flags Row */}
              <div className="grid grid-cols-2 gap-4">
                <div
                  onClick={() => handleChange('flagged', !editedTicket.flagged)}
                  className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${editedTicket.flagged
                      ? 'bg-orange-500/10 border-orange-500/50 text-orange-400'
                      : 'bg-black/20 border-cyan-900/20 text-cyan-900 hover:border-orange-500/30'
                    }`}
                >
                  <Flag size={20} className={editedTicket.flagged ? 'animate-pulse' : ''} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black">Hazard/Flag</div>
                    <div className="text-[9px] font-bold opacity-60">Priority Signal</div>
                  </div>
                </div>
                <div
                  onClick={() => handleChange('requiresHuman', !editedTicket.requiresHuman)}
                  className={`flex items-center gap-4 p-4 border rounded-md cursor-pointer transition-all ${editedTicket.requiresHuman
                      ? 'bg-yellow-500/10 border-yellow-500/50 text-yellow-500 font-black'
                      : 'bg-black/20 border-cyan-900/20 text-cyan-900 hover:border-yellow-500/30'
                    }`}
                >
                  <User size={20} className={editedTicket.requiresHuman ? 'animate-pulse' : ''} />
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] font-black">Bio-Link</div>
                    <div className="text-[9px] font-bold opacity-60">Human Interface Req</div>
                  </div>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-2">
                <label className="text-[10px] uppercase tracking-[0.3em] text-cyan-700 font-black">Unit Log Entries</label>
                <textarea
                  value={editedTicket.description}
                  onChange={(e) => handleChange('description', e.target.value)}
                  rows={6}
                  placeholder="Record unit parameters and observations..."
                  className="w-full bg-black/40 border border-cyan-900/30 text-cyan-200 p-4 focus:border-cyan-500 focus:outline-none font-mono text-[11px] leading-relaxed uppercase tracking-wider rounded-md"
                />
              </div>

            </div>

            {/* Footer */}
            <div className="p-6 border-t border-cyan-500/20 bg-slate-950/40 flex justify-between items-center">
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    onDelete(editedTicket.id);
                    onClose();
                  }}
                  className="p-3 text-rose-900 hover:text-rose-500 bg-rose-950/20 border border-rose-950/30 hover:border-rose-500/40 rounded-md transition-all group"
                  title="Terminate Unit"
                >
                  <Trash2 size={20} className="group-hover:scale-110 transition-transform" />
                </button>
                {editedTicket.status !== TicketStatus.BACKLOG && (
                  <button
                    onClick={() => {
                      onSave({ ...editedTicket, status: TicketStatus.BACKLOG });
                      onClose();
                    }}
                    className="px-4 py-2 text-[10px] font-black text-cyan-900 hover:text-cyan-400 border border-cyan-900 text-center flex items-center gap-2 rounded-md hover:border-cyan-400 transition-all uppercase tracking-widest"
                    title="Move to Stasis (Backlog)"
                  >
                    <Archive size={14} /> Stasis
                  </button>
                )}
              </div>

              <div className="flex gap-3">
                <Button
                  variant="secondary"
                  onClick={() => onConsultMother(editedTicket, currentEpic?.name)}
                  className="mother-btn px-6 py-2 border-purple-500/30 text-purple-400 hover:bg-purple-900/20 text-[10px] font-black tracking-widest"
                >
                  <BrainCircuit size={16} /> CONSULT MOTHER
                </Button>
                <Button onClick={() => { onSave(editedTicket); onClose(); }} className="mother-btn px-8 py-2 font-black text-[10px] tracking-widest">
                  <Save size={16} /> RECORD DATA
                </Button>
              </div>
            </div>

            {/* Corner Decorative Orbs */}
            <div className="absolute top-2 left-2 w-1 h-1 bg-cyan-500/60 rounded-full"></div>
            <div className="absolute top-2 right-2 w-1 h-1 bg-cyan-500/60 rounded-full"></div>
            <div className="absolute bottom-2 left-2 w-1 h-1 bg-cyan-500/60 rounded-full"></div>
            <div className="absolute bottom-2 right-2 w-1 h-1 bg-cyan-500/60 rounded-full"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
