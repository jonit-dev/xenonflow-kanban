import { motion } from 'framer-motion';
import { Activity, Flag, User } from 'lucide-react';
import React from 'react';
import { Epic, Ticket } from '../types';

interface TimelineViewProps {
  tickets: Ticket[];
  epics: Epic[];
  onTicketClick: (ticket: Ticket) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tickets, epics, onTicketClick }) => {
  const getDates = () => {
    const allDates = tickets
      .flatMap(t => [t.startDate, t.endDate])
      .filter(d => !!d)
      .map(d => new Date(d!));

    if (allDates.length === 0) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 14);
      return { start, end };
    }

    const min = new Date(Math.min(...allDates.map(d => d.getTime())));
    const max = new Date(Math.max(...allDates.map(d => d.getTime())));

    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 7);

    return { start: min, end: max };
  };

  const { start: startDate, end: endDate } = getDates();

  const days: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  const getGridPosition = (ticket: Ticket) => {
    if (!ticket.startDate) return null;

    const start = new Date(ticket.startDate);
    const end = ticket.endDate ? new Date(ticket.endDate) : new Date(ticket.startDate);

    const startDiff = Math.floor((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    return {
      gridColumnStart: startDiff + 2,
      gridColumnEnd: `span ${duration}`
    };
  };

  const scheduledTickets = tickets
    .filter(t => t.startDate)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-transparent">
      {scheduledTickets.length === 0 && (
        <div className="flex-1 flex flex-col items-center justify-center text-cyan-900 font-mono">
          <Activity className="w-16 h-16 mb-6 opacity-20 animate-pulse" />
          <p className="font-black uppercase tracking-[0.4em] text-sm">No Temporal Data Detected</p>
          <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-widest">Assign activation markers to units to populate Chronos-Feed.</p>
        </div>
      )}

      {scheduledTickets.length > 0 && (
        <div className="flex-1 overflow-auto p-8 relative custom-scrollbar">
          <div
            className="grid gap-y-3 select-none"
            style={{
              gridTemplateColumns: `250px repeat(${days.length}, minmax(45px, 1fr))`
            }}
          >
            {/* Header Row */}
            <div className="sticky top-0 z-20 bg-slate-950/80 backdrop-blur-md col-span-full grid border-b border-cyan-900/30 mb-4" style={{ gridTemplateColumns: `250px repeat(${days.length}, minmax(45px, 1fr))` }}>
              <div className="p-4 text-[10px] font-black text-cyan-600 uppercase tracking-[0.3em]">Temporal Entity</div>
              {days.map((day, i) => (
                <div key={i} className={`p-4 text-[9px] font-black font-mono flex flex-col items-center justify-center border-l border-cyan-900/10 ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-cyan-500/5 text-cyan-400' : 'text-cyan-800'}`}>
                  <span>{day.getDate()}</span>
                  <span className="opacity-50 text-[7px] mt-0.5">{day.toLocaleDateString('en-US', { weekday: 'short' }).toUpperCase()}</span>
                </div>
              ))}
            </div>

            {scheduledTickets.map(ticket => {
              const pos = getGridPosition(ticket);
              const epic = epics.find(e => e.id === ticket.epicId);

              // Flag styling for timeline bar
              const getFlagBarStyle = () => {
                if (ticket.flagged && ticket.requiresHuman) {
                  return 'from-orange-500/20 to-yellow-500/20 border-orange-500/50';
                }
                if (ticket.flagged) return 'bg-orange-500/20 border-orange-500/50';
                if (ticket.requiresHuman) return 'bg-yellow-500/20 border-yellow-500/50';
                return '';
              };

              return (
                <React.Fragment key={ticket.id}>
                  <div className="sticky left-0 z-10 bg-slate-900/40 backdrop-blur-md border border-cyan-900/20 p-3 flex items-center h-12 rounded-l-lg group cursor-pointer" onClick={() => onTicketClick(ticket)}>
                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 shrink-0">
                        {ticket.flagged && <Flag size={11} className="text-orange-500" />}
                        {ticket.requiresHuman && <User size={11} className="text-yellow-500" />}
                      </div>
                      <div className="truncate text-[10px] text-cyan-100 font-black uppercase tracking-wider group-hover:text-cyan-400 transition-colors">
                        {ticket.title}
                      </div>
                    </div>
                  </div>

                  {pos && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`relative h-10 mt-1 rounded-r-lg text-[9px] font-black flex items-center px-4 truncate cursor-pointer hover:brightness-125 transition-all shadow-lg border-y border-r border-white/5 uppercase tracking-widest ${getFlagBarStyle()}`}
                      style={{
                        ...pos,
                        backgroundColor: epic ? `${epic.color}30` : '#083344',
                        color: epic ? epic.color : '#06b6d4',
                        borderColor: epic ? `${epic.color}50` : '#06b6d430',
                        boxShadow: epic ? `0 0 20px ${epic.color}20` : '0 0 20px rgba(6,182,212,0.1)'
                      }}
                      onClick={() => onTicketClick(ticket)}
                    >
                      <span className="truncate group-hover:animate-pulse">{ticket.title}</span>
                      <div className="absolute top-0 right-0 w-1 h-full bg-white/10"></div>
                    </motion.div>
                  )}
                </React.Fragment>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
