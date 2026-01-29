import React, { useState } from 'react';
import { Ticket, TicketStatus, Epic } from '../types';
import { MoreVertical, Trash2, BrainCircuit, Hash, Calendar } from 'lucide-react';

// --- Ticket Component ---

interface TicketCardProps {
  ticket: Ticket;
  epic?: Epic;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onClick: (ticket: Ticket) => void;
}

export const TicketCard: React.FC<TicketCardProps> = ({ ticket, epic, onDragStart, onClick }) => {
  
  const priorityColor = {
    low: 'border-l-slate-500',
    medium: 'border-l-cyan-500',
    high: 'border-l-amber-500',
    critical: 'border-l-rose-600 shadow-[0_0_10px_rgba(225,29,72,0.2)]'
  };

  // Format date slightly
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
        group relative p-4 mb-3 bg-slate-900/80 backdrop-blur-sm 
        border border-slate-700/50 ${priorityColor[ticket.priority]} border-l-4 
        hover:border-cyan-500/50 hover:bg-slate-800/60 
        transition-all cursor-move alien-glow-hover select-none
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <h4 className="text-cyan-100 font-medium text-sm leading-tight pr-2">{ticket.title}</h4>
        {ticket.aiInsights && (
          <BrainCircuit size={14} className="text-purple-500 animate-pulse shrink-0" title="Mother has spoken" />
        )}
      </div>

      <p className="text-slate-400 text-xs mb-3 line-clamp-2">{ticket.description}</p>

      {/* Date Row if exists */}
      {(ticket.startDate || ticket.endDate) && (
          <div className="flex items-center gap-2 text-[10px] text-slate-500 mb-2 font-mono">
              <Calendar size={10} />
              <span>{formatDate(ticket.startDate) || '...'}</span>
              <span>→</span>
              <span>{formatDate(ticket.endDate) || '...'}</span>
          </div>
      )}

      <div className="flex items-center justify-between mt-2">
        <div className="flex items-center gap-2">
            {/* Story Points */}
            {ticket.storyPoints > 0 && (
                <div className="flex items-center text-[10px] text-slate-500 bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                    <Hash size={10} className="mr-1"/>
                    {ticket.storyPoints}
                </div>
            )}
            {/* Epic Badge */}
            {epic && (
                <div 
                    className="text-[10px] px-1.5 py-0.5 rounded border"
                    style={{ 
                        borderColor: epic.color, 
                        color: epic.color,
                        backgroundColor: `${epic.color}10` // 10% opacity
                    }}
                >
                    {epic.name}
                </div>
            )}
        </div>

        <span className={`text-[9px] uppercase tracking-wider px-1.5 py-0.5 rounded ${ticket.priority === 'critical' ? 'bg-rose-950 text-rose-400' : 'bg-slate-800 text-slate-500'}`}>
          {ticket.priority.substring(0,3)}
        </span>
      </div>
      
      {/* Hover decoration */}
      <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-transparent group-hover:border-cyan-500/50 transition-colors"></div>
      <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-transparent group-hover:border-cyan-500/50 transition-colors"></div>
    </div>
  );
};

// --- Column Component ---

interface ColumnProps {
  status: TicketStatus;
  title: string;
  tickets: Ticket[];
  epics: Epic[];
  onDrop: (e: React.DragEvent, status: TicketStatus) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragStart: (e: React.DragEvent, id: string) => void;
  onTicketClick: (ticket: Ticket) => void;
}

export const Column: React.FC<ColumnProps> = ({ 
  status, 
  title, 
  tickets, 
  epics,
  onDrop, 
  onDragOver,
  onDragStart,
  onTicketClick
}) => {
  return (
    <div 
      className="flex flex-col h-full min-w-[300px] w-full bg-slate-900/20 border border-slate-800/50 rounded-sm"
      onDrop={(e) => onDrop(e, status)}
      onDragOver={onDragOver}
    >
      <div className="p-4 border-b border-slate-800/50 flex justify-between items-center bg-slate-950/50">
        <div className="flex items-center gap-2">
          <div className={`w-2 h-2 rounded-full ${
            status === TicketStatus.TODO ? 'bg-slate-500' :
            status === TicketStatus.IN_PROGRESS ? 'bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]' :
            status === TicketStatus.REVIEW ? 'bg-purple-500' :
            'bg-emerald-500'
          }`}></div>
          <h3 className="text-sm font-bold tracking-widest text-slate-300">{title}</h3>
        </div>
        <div className="flex items-center gap-2">
             <span className="text-[10px] text-slate-600 font-mono flex items-center" title="Total SP">
                <Hash size={10} className="mr-0.5"/>
                {tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0)}
             </span>
             <span className="text-xs text-slate-600 font-mono">[{tickets.length}]</span>
        </div>
      </div>

      <div className="flex-1 p-3 overflow-y-auto min-h-[150px] transition-colors duration-200" id={`col-${status}`}>
        {tickets.map(ticket => (
          <TicketCard 
            key={ticket.id} 
            ticket={ticket} 
            epic={epics.find(e => e.id === ticket.epicId)}
            onDragStart={onDragStart}
            onClick={onTicketClick}
          />
        ))}
        {tickets.length === 0 && (
            <div className="h-24 flex items-center justify-center border border-dashed border-slate-800 text-slate-700 text-xs">
                AWAITING UNITS
            </div>
        )}
      </div>
    </div>
  );
};
