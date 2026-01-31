import { Activity, BrainCircuit, Calendar, Flag, GitPullRequest, Hash, MoreVertical, Pencil, Trash2, User } from 'lucide-react';
import React from 'react';
import { Epic, Ticket, TicketStatus } from '../types';
import { sortTicketsByPriority } from '../lib/ticketUtils';

// --- Ticket Component ---

interface TicketCardProps {
  ticket: Ticket;
  epic?: Epic;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, epic, onDragStart, onClick }) => {

  const impact = ticket.impact || 'low';

  const impactColor: Record<string, string> = {
    low: 'border-l-emerald-600',
    medium: 'border-l-cyan-500',
    high: 'border-l-amber-500',
    critical: 'border-l-rose-500 shadow-[0_0_20px_rgba(244,63,94,0.5)]'
  };

  const flagColor = {
    hazard: 'bg-orange-500/10 border-orange-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    bioLink: 'bg-yellow-500/10 border-yellow-500/50 shadow-[0_0_10px_rgba(245,158,11,0.2)]',
    both: 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/30 shadow-[0_0_15px_rgba(245,158,11,0.2)]',
    none: 'border-cyan-900/20'
  };

  const getFlagClass = () => {
    if (ticket.flagged && ticket.requiresHuman) return flagColor.both;
    if (ticket.flagged) return flagColor.hazard;
    if (ticket.requiresHuman) return flagColor.bioLink;
    return flagColor.none;
  };

  const formatDate = (dateStr?: string) => {
    if (!dateStr) return null;
    const d = new Date(dateStr);
    return `${d.getMonth() + 1}/${d.getDate()}`;
  }

  return (
    <div
      draggable
      onDragStart={(e) => onDragStart(e, ticket.id)}
      onClick={() => onClick(ticket)}
      className={`
        group relative p-2.5 mb-2 bg-slate-900/40 backdrop-blur-md
        border ${getFlagClass()} ${impactColor[impact]} border-l-4
        hover:border-cyan-500/40 hover:bg-slate-800/40
        transition-all cursor-move select-none rounded-r-lg
      `}
    >
      <div className="flex justify-between items-start mb-1.5">
        <div className="flex items-center gap-2">
          <h4 className="text-cyan-100 font-medium text-xs leading-tight pr-2 group-hover:text-cyan-400 transition-colors">
            {ticket.title}
          </h4>
          <div className="flex items-center gap-1 shrink-0">
            {ticket.prUrl && (
              <a 
                href={ticket.prUrl} 
                target="_blank" 
                rel="noopener noreferrer"
                onClick={(e) => e.stopPropagation()}
                className="hover:text-purple-400 transition-colors"
                title={ticket.prUrl}
              >
                <GitPullRequest size={12} className="text-purple-500" />
              </a>
            )}
            {ticket.flagged && <Flag size={12} className="text-orange-500" />}
            {ticket.requiresHuman && <User size={12} className="text-yellow-500" />}
          </div>
        </div>
        {ticket.aiInsights && (
          <BrainCircuit size={14} className="text-cyan-400 animate-pulse shrink-0" />
        )}
      </div>

      <p className="text-slate-500 text-[10px] mb-1.5 line-clamp-2 leading-relaxed">
        {ticket.description || "NO DATA RECORDED"}
      </p>

      {(ticket.startDate || ticket.endDate) && (
        <div className="flex items-center gap-2 text-[9px] text-cyan-800 mb-1.5">
          <Calendar size={10} />
          <span>{formatDate(ticket.startDate) || '...'}</span>
          <span>»</span>
          <span>{formatDate(ticket.endDate) || '...'}</span>
        </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
          {ticket.effort > 0 && (
            <div className="flex items-center text-[9px] font-black text-cyan-600 bg-black/40 px-2 py-0.5 rounded border border-cyan-900/30">
              <Hash size={9} className="mr-0.5" />
              {ticket.effort}
            </div>
          )}
          {epic && (
            <div
              className="text-[9px] font-black px-2 py-0.5 rounded border uppercase tracking-widest"
              style={{
                borderColor: `${epic.color}40`,
                color: epic.color,
                backgroundColor: `${epic.color}10`
              }}
            >
              {epic.name}
            </div>
          )}
        </div>

        <span className={`text-[8px] font-black uppercase tracking-[0.2em] px-2 py-0.5 rounded ${impact === 'critical' ? 'bg-rose-950/50 text-rose-500 border border-rose-500/30' : 'bg-slate-950/50 text-slate-600 border border-slate-800/50'}`}>
          {impact.substring(0, 4)}
        </span>
      </div>

      {/* Corner decorations */}
      <div className="absolute top-0 right-0 w-1.5 h-1.5 border-t border-r border-cyan-500/30 transition-all group-hover:w-3 group-hover:h-3"></div>
      <div className="absolute bottom-0 left-0 w-1.5 h-1.5 border-b border-l border-cyan-500/30 transition-all group-hover:w-3 group-hover:h-3"></div>
    </div>
  );
};

// --- Column Component ---

interface ColumnProps {
  id: string;
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  epics: Epic[];
  onDrop: (e: React.DragEvent, status: TicketStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onTicketClick: (ticket: Ticket) => void;
  onRename?: (id: string, newTitle: string) => void;
  onDelete?: (id: string) => void;
}

export const Column: React.FC<ColumnProps> = ({
  id,
  status,
  title,
  tickets,
  epics,
  onDrop,
  onDragOver,
  onDragStart,
  onTicketClick,
  onRename,
  onDelete
}) => {
  const [isEditing, setIsEditing] = React.useState(false);
  const [newTitle, setNewTitle] = React.useState(title);
  const [showOptions, setShowOptions] = React.useState(false);

  const handleRename = () => {
    if (onRename && newTitle.trim() !== '' && newTitle !== title) {
      onRename(id, newTitle);
    }
    setIsEditing(false);
    setShowOptions(false);
  };

  return (
    <div
      className="flex flex-col h-full min-w-[280px] max-w-[340px] w-full bg-slate-950/20 backdrop-blur-sm border border-cyan-900/20 rounded-lg overflow-hidden group/column"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="p-4 border-b border-cyan-900/30 flex justify-between items-center bg-cyan-950/10">
        <div className="flex items-center gap-3 flex-1 overflow-hidden">
          <div className={`w-2 h-2 rounded-sm rotate-45 shrink-0 ${status === TicketStatus.TODO ? 'bg-slate-600' :
            status === TicketStatus.IN_PROGRESS ? 'bg-cyan-500 shadow-[0_0_10px_rgba(6,182,212,1)]' :
              status === TicketStatus.REVIEW ? 'bg-purple-500' :
                'bg-emerald-500'
            }`}></div>

          {isEditing ? (
            <div className="flex items-center gap-1 w-full">
              <input
                autoFocus
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onBlur={handleRename}
                onKeyDown={(e) => e.key === 'Enter' && handleRename()}
                className="bg-slate-900 border border-cyan-500/50 text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200 px-2 py-0.5 rounded outline-none w-full"
              />
            </div>
          ) : (
            <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-cyan-200 text-glow truncate">{title}</h3>
          )}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-2 text-cyan-800">
            <span className="text-[10px] font-black font-mono flex items-center">
              <Hash size={10} className="mr-0.5" />
              {tickets.reduce((acc, t) => acc + (t.effort || 0), 0)}
            </span>
            <span className="text-[10px] font-black font-mono">[{tickets.length}]</span>
          </div>

          <div className="relative">
            <button
              onClick={() => setShowOptions(!showOptions)}
              className="p-1 hover:bg-cyan-500/10 rounded transition-colors text-cyan-700 hover:text-cyan-400 opacity-0 group-hover/column:opacity-100"
            >
              <MoreVertical size={14} />
            </button>

            {showOptions && (
              <>
                <div
                  className="fixed inset-0 z-10"
                  onClick={() => setShowOptions(false)}
                />
                <div className="absolute right-0 mt-1 w-32 bg-slate-900 border border-cyan-500/30 rounded shadow-xl z-20 overflow-hidden">
                  <button
                    onClick={() => { setIsEditing(true); setShowOptions(false); }}
                    className="w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-widest text-cyan-400 hover:bg-cyan-500/10 flex items-center gap-2"
                  >
                    <Pencil size={10} /> Rename
                  </button>
                  <button
                    onClick={() => { if (onDelete) onDelete(id); setShowOptions(false); }}
                    className="w-full text-left px-3 py-2 text-[9px] font-black uppercase tracking-widest text-rose-500 hover:bg-rose-500/10 flex items-center gap-2"
                  >
                    <Trash2 size={10} /> Delete
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200" id={`col-${status}`}>
        {sortTicketsByPriority(tickets).map(ticket => (
          <TicketCard
            key={ticket.id}
            ticket={ticket}
            epic={epics.find(e => e.id === ticket.epicId)}
            onDragStart={onDragStart}
            onClick={onTicketClick}
          />
        ))}
        {tickets.length === 0 && (
          <div className="h-24 flex flex-col items-center justify-center border border-dashed border-cyan-900/20 text-cyan-900 text-[10px] font-black tracking-widest uppercase">
            <Activity size={16} className="mb-2 opacity-30 animate-pulse" />
            Sector Idle
          </div>
        )}
      </div>
    </div>
  );
};
