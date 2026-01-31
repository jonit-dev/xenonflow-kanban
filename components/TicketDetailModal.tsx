import React, { useState, useEffect } from 'react';
import { Ticket, TicketStatus, Epic } from '../types';
import { Button } from './ui/Button';
import { X, Save, Trash2, BrainCircuit, Layers, Calendar, Archive, Flag, User } from 'lucide-react';

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

  if (!isOpen || !editedTicket) return null;

  const handleChange = (field: keyof Ticket, value: any) => {
    setEditedTicket(prev => prev ? { ...prev, [field]: value } : null);
  };

  const currentEpic = epics.find(e => e.id === editedTicket.epicId);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      <div className="relative w-full max-w-2xl bg-[#0b1221] border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] flex flex-col max-h-[90vh] animate-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="p-4 border-b border-cyan-500/20 bg-cyan-950/10 flex justify-between items-center">
          <div className="flex items-center gap-2">
             <div className="w-2 h-6 bg-cyan-500"></div>
             <h2 className="text-lg font-display font-bold text-cyan-400 tracking-wider">UNIT DATA TERMINAL</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-cyan-400">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto space-y-6">
          
          {/* Title Input */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Unit Identifier</label>
            <input 
              type="text"
              value={editedTicket.title}
              onChange={(e) => handleChange('title', e.target.value)}
              className="w-full bg-slate-900/50 border border-slate-700 text-cyan-100 p-2 focus:border-cyan-500 focus:outline-none font-medium text-lg"
            />
          </div>

          {/* Row 1: Status, Priority, Points, Epic */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {/* Status */}
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Status</label>
                <select 
                    value={editedTicket.status}
                    onChange={(e) => handleChange('status', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                >
                    {Object.values(TicketStatus).map(s => (
                        <option key={s} value={s}>{s}</option>
                    ))}
                </select>
            </div>

            {/* Priority */}
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Priority</label>
                <select 
                    value={editedTicket.priority}
                    onChange={(e) => handleChange('priority', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                >
                    <option value="low">LOW</option>
                    <option value="medium">MEDIUM</option>
                    <option value="high">HIGH</option>
                    <option value="critical">CRITICAL</option>
                </select>
            </div>

            {/* Story Points */}
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Complexity (SP)</label>
                <input 
                    type="number"
                    min="0"
                    value={editedTicket.storyPoints}
                    onChange={(e) => handleChange('storyPoints', parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-cyan-300 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
            </div>

            {/* Epic */}
            <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Protocol (Epic)</label>
                <div className="relative">
                    <select 
                        value={editedTicket.epicId || ''}
                        onChange={(e) => handleChange('epicId', e.target.value || undefined)}
                        className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-2 text-sm focus:border-cyan-500 focus:outline-none appearance-none"
                    >
                        <option value="">NO PROTOCOL</option>
                        {epics.map(epic => (
                            <option key={epic.id} value={epic.id}>{epic.name}</option>
                        ))}
                    </select>
                    <Layers className="absolute right-2 top-2.5 text-slate-500 pointer-events-none" size={14} />
                </div>
            </div>
          </div>

          {/* Row 2: Dates */}
          <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <Calendar size={12} /> Start Date
                </label>
                <input 
                    type="date"
                    value={editedTicket.startDate || ''}
                    onChange={(e) => handleChange('startDate', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold flex items-center gap-2">
                    <Calendar size={12} /> End Date
                </label>
                <input 
                    type="date"
                    value={editedTicket.endDate || ''}
                    onChange={(e) => handleChange('endDate', e.target.value)}
                    className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-2 text-sm focus:border-cyan-500 focus:outline-none"
                />
              </div>
          </div>

          {/* Flags Row */}
          <div className="grid grid-cols-2 gap-4">
              <div 
                onClick={() => handleChange('flagged', !editedTicket.flagged)}
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                  editedTicket.flagged 
                    ? 'bg-orange-950/30 border-orange-500/50 text-orange-400' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-orange-500/30'
                }`}
              >
                <Flag size={16} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold">Flagged</div>
                  <div className="text-[9px] opacity-70">Important/Urgent</div>
                </div>
              </div>
              <div 
                onClick={() => handleChange('requiresHuman', !editedTicket.requiresHuman)}
                className={`flex items-center gap-3 p-3 border cursor-pointer transition-all ${
                  editedTicket.requiresHuman 
                    ? 'bg-yellow-950/30 border-yellow-500/50 text-yellow-400' 
                    : 'bg-slate-900/50 border-slate-700 text-slate-500 hover:border-yellow-500/30'
                }`}
              >
                <User size={16} />
                <div>
                  <div className="text-[10px] uppercase tracking-widest font-bold">Requires Human</div>
                  <div className="text-[9px] opacity-70">Needs intervention</div>
                </div>
              </div>
          </div>

          {/* Description - supports markdown */}
          <div className="space-y-1">
            <label className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Unit Description (Markdown)</label>
            <textarea 
              value={editedTicket.description}
              onChange={(e) => handleChange('description', e.target.value)}
              rows={6}
              placeholder="Supports **bold**, *italic*, `code`, - lists..."
              className="w-full bg-slate-900/50 border border-slate-700 text-slate-300 p-3 focus:border-cyan-500 focus:outline-none font-mono text-sm leading-relaxed"
            />
          </div>

        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950 flex justify-between items-center">
          <div className="flex gap-2">
            <button 
                onClick={() => {
                    onDelete(editedTicket.id);
                    onClose();
                }}
                className="text-rose-500 hover:text-rose-400 text-xs flex items-center gap-2 hover:bg-rose-950/30 p-2 rounded transition-colors"
                title="Terminate Unit"
            >
                <Trash2 size={16} />
            </button>
            {editedTicket.status !== TicketStatus.BACKLOG && (
                <button 
                    onClick={() => {
                        onSave({ ...editedTicket, status: TicketStatus.BACKLOG });
                        onClose();
                    }}
                    className="text-slate-500 hover:text-cyan-400 text-xs flex items-center gap-2 hover:bg-slate-900 p-2 rounded transition-colors"
                    title="Move to Stasis (Backlog)"
                >
                    <Archive size={16} /> STASIS
                </button>
            )}
          </div>

          <div className="flex gap-3">
            <Button 
                variant="secondary" 
                onClick={() => onConsultMother(editedTicket, currentEpic?.name)}
                className="border-purple-500/30 text-purple-300 hover:bg-purple-900/20"
            >
                <BrainCircuit size={16} /> ASK MOTHER
            </Button>
            <Button onClick={() => { onSave(editedTicket); onClose(); }}>
                <Save size={16} /> SAVE DATA
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};
