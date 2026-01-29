import React from 'react';
import { Ticket, TicketStatus, Epic } from '../types';
import { Button } from './ui/Button';
import { Hash, Play, Archive, Database, Calendar } from 'lucide-react';

interface BacklogViewProps {
  tickets: Ticket[];
  epics: Epic[];
  onTicketClick: (ticket: Ticket) => void;
  onMoveToBoard: (ticket: Ticket) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ tickets, epics, onTicketClick, onMoveToBoard }) => {
  
  const priorityColor = {
    low: 'text-slate-400',
    medium: 'text-cyan-400',
    high: 'text-amber-400',
    critical: 'text-rose-500 font-bold'
  };

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#020617] p-6">
       
       <div className="mb-4 flex items-center justify-between">
            <div className="flex items-center gap-2 text-slate-500">
                <Archive size={16} />
                <h3 className="text-xs font-bold uppercase tracking-widest">Stasis Chamber (Backlog)</h3>
                <span className="bg-slate-900 text-slate-500 text-[10px] px-2 py-0.5 rounded-full border border-slate-800">
                    {tickets.length} UNITS
                </span>
            </div>
            <div className="text-[10px] text-slate-600 font-mono">
                TOTAL BIOMASS: {tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0)} SP
            </div>
       </div>

       {tickets.length === 0 ? (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500 border border-dashed border-slate-800 rounded-lg bg-slate-900/20">
                <Database className="w-12 h-12 mb-4 opacity-50" />
                <p>CHAMBER EMPTY</p>
                <p className="text-xs mt-2">All units are currently deployed or non-existent.</p>
            </div>
       ) : (
           <div className="flex-1 overflow-y-auto pr-2">
               <div className="space-y-1">
                   {/* Header */}
                   <div className="grid grid-cols-12 gap-4 px-4 py-2 text-[10px] font-bold text-slate-600 uppercase tracking-wider border-b border-slate-800">
                       <div className="col-span-5">Unit Identifier</div>
                       <div className="col-span-2">Protocol</div>
                       <div className="col-span-2">Priority</div>
                       <div className="col-span-1 text-center">SP</div>
                       <div className="col-span-2 text-right">Action</div>
                   </div>

                   {/* Rows */}
                   {tickets.map(ticket => {
                       const epic = epics.find(e => e.id === ticket.epicId);
                       return (
                           <div 
                                key={ticket.id}
                                className="group grid grid-cols-12 gap-4 px-4 py-3 items-center bg-slate-900/30 border border-slate-800/50 hover:bg-slate-900/60 hover:border-cyan-500/30 transition-all rounded-sm cursor-pointer"
                                onClick={() => onTicketClick(ticket)}
                           >
                               <div className="col-span-5">
                                   <div className="font-medium text-slate-300 group-hover:text-cyan-200 transition-colors truncate">
                                       {ticket.title}
                                   </div>
                                   <div className="text-[10px] text-slate-600 truncate">{ticket.description}</div>
                               </div>

                               <div className="col-span-2">
                                   {epic ? (
                                        <span className="text-[10px] px-1.5 py-0.5 rounded border border-slate-800/50" style={{ color: epic.color, borderColor: `${epic.color}30` }}>
                                            {epic.name}
                                        </span>
                                   ) : (
                                       <span className="text-[10px] text-slate-700">-</span>
                                   )}
                               </div>

                               <div className={`col-span-2 text-xs uppercase tracking-wide ${priorityColor[ticket.priority]}`}>
                                   {ticket.priority}
                               </div>

                               <div className="col-span-1 flex justify-center">
                                    {ticket.storyPoints > 0 && (
                                        <div className="flex items-center text-[10px] text-slate-500">
                                            <Hash size={10} className="mr-0.5"/> {ticket.storyPoints}
                                        </div>
                                    )}
                               </div>

                               <div className="col-span-2 flex justify-end">
                                   <button
                                        onClick={(e) => {
                                            e.stopPropagation();
                                            onMoveToBoard(ticket);
                                        }}
                                        className="opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 bg-cyan-950/50 hover:bg-cyan-900/50 text-cyan-400 border border-cyan-500/30 px-2 py-1 rounded text-[10px] uppercase font-bold tracking-wider"
                                   >
                                       <Play size={10} /> Initialize
                                   </button>
                               </div>
                           </div>
                       );
                   })}
               </div>
           </div>
       )}
    </div>
  );
};
