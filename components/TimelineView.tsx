import React from 'react';
import { Ticket, Epic } from '../types';
import { Calendar } from 'lucide-react';

interface TimelineViewProps {
  tickets: Ticket[];
  epics: Epic[];
  onTicketClick: (ticket: Ticket) => void;
}

export const TimelineView: React.FC<TimelineViewProps> = ({ tickets, epics, onTicketClick }) => {
  // Helper to get dates
  const getDates = () => {
    // Collect all dates
    const allDates = tickets
      .flatMap(t => [t.startDate, t.endDate])
      .filter(d => !!d)
      .map(d => new Date(d!));
    
    // Default range if no tickets: today to +14 days
    if (allDates.length === 0) {
      const start = new Date();
      const end = new Date();
      end.setDate(end.getDate() + 14);
      return { start, end };
    }

    const min = new Date(Math.min(...allDates.map(d => d.getTime())));
    const max = new Date(Math.max(...allDates.map(d => d.getTime())));
    
    // Add buffer (3 days before, 7 days after)
    min.setDate(min.getDate() - 3);
    max.setDate(max.getDate() + 7);

    return { start: min, end: max };
  };

  const { start: startDate, end: endDate } = getDates();

  // Generate array of days
  const days: Date[] = [];
  const curr = new Date(startDate);
  while (curr <= endDate) {
    days.push(new Date(curr));
    curr.setDate(curr.getDate() + 1);
  }

  // Calculate grid position
  const getGridPosition = (ticket: Ticket) => {
    if (!ticket.startDate) return null;
    
    const start = new Date(ticket.startDate);
    const end = ticket.endDate ? new Date(ticket.endDate) : new Date(ticket.startDate);
    
    // Diff in days from timeline start
    const startDiff = Math.floor((start.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    const duration = Math.max(1, Math.floor((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1);

    // Grid starts at column 2 (column 1 is ticket name)
    return {
      gridColumnStart: startDiff + 2,
      gridColumnEnd: `span ${duration}`
    };
  };

  // Group tickets by Epic? Or just list scheduled vs unscheduled?
  // Let's just list scheduled tickets sorted by start date
  const scheduledTickets = tickets
    .filter(t => t.startDate)
    .sort((a, b) => new Date(a.startDate!).getTime() - new Date(b.startDate!).getTime());

  return (
    <div className="flex-1 h-full overflow-hidden flex flex-col bg-[#020617]">
        {/* Warning if no scheduled tickets */}
        {scheduledTickets.length === 0 && (
            <div className="flex-1 flex flex-col items-center justify-center text-slate-500">
                <Calendar className="w-12 h-12 mb-4 opacity-50" />
                <p>NO TEMPORAL DATA DETECTED</p>
                <p className="text-xs mt-2">Assign Start Dates to Units to populate Timeline.</p>
            </div>
        )}

        {scheduledTickets.length > 0 && (
            <div className="flex-1 overflow-auto p-6 relative">
                 <div 
                    className="grid gap-y-2 select-none"
                    style={{
                        gridTemplateColumns: `200px repeat(${days.length}, minmax(40px, 1fr))`
                    }}
                 >
                     {/* Header Row */}
                     <div className="sticky top-0 z-20 bg-[#020617] col-span-full grid" style={{ gridTemplateColumns: `200px repeat(${days.length}, minmax(40px, 1fr))` }}>
                        <div className="p-2 text-xs font-bold text-slate-500 uppercase tracking-wider border-b border-slate-800 bg-[#020617]">UNIT</div>
                        {days.map((day, i) => (
                            <div key={i} className={`p-2 text-[10px] font-mono border-b border-slate-800 flex flex-col items-center justify-center ${day.getDay() === 0 || day.getDay() === 6 ? 'bg-slate-900/30' : ''}`}>
                                <span className="text-slate-500">{day.getDate()}</span>
                                <span className="text-slate-600">{day.toLocaleDateString('en-US', { weekday: 'narrow' })}</span>
                            </div>
                        ))}
                     </div>

                     {/* Background Grid Lines (Absolute overlay hack or just border-right on cells? let's do simple row rendering) */}
                     {/* Actually, let's just render the ticket rows directly. */}

                     {scheduledTickets.map(ticket => {
                         const pos = getGridPosition(ticket);
                         const epic = epics.find(e => e.id === ticket.epicId);
                         
                         return (
                             <React.Fragment key={ticket.id}>
                                 {/* Ticket Label Column */}
                                 <div className="sticky left-0 z-10 bg-[#020617] border-r border-slate-800 p-2 flex items-center h-10 shadow-lg">
                                     <div className="truncate text-xs text-cyan-100 font-medium cursor-pointer hover:text-cyan-400 transition-colors" onClick={() => onTicketClick(ticket)}>
                                         {ticket.title}
                                     </div>
                                 </div>

                                 {/* Timeline Bar Track (Empty cells for grid lines) - this is hard in a single grid without nested loops. 
                                     Instead, we rely on the grid placement.
                                 */}
                                 
                                 {/* The Bar */}
                                 {pos && (
                                     <div 
                                        className="relative h-8 mt-1 rounded text-[10px] flex items-center px-2 truncate cursor-pointer hover:brightness-110 transition-all shadow-md group border border-white/10"
                                        style={{
                                            ...pos,
                                            backgroundColor: epic ? epic.color : '#64748b', // Default slate-500
                                            color: '#fff' 
                                        }}
                                        onClick={() => onTicketClick(ticket)}
                                     >
                                         <span className="truncate drop-shadow-md">{ticket.title}</span>
                                     </div>
                                 )}
                             </React.Fragment>
                         );
                     })}

                     {/* Vertical Grid Lines (Background) - Optional, complex to implement perfectly with this grid method without extra divs. */}
                 </div>
            </div>
        )}
    </div>
  );
};
