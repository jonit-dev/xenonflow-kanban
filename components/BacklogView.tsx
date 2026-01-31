import { motion } from 'framer-motion';
import { Activity, Archive, Database, Flag, Hash, Play, User } from 'lucide-react';
import React, { useMemo } from 'react';
import { Epic, Ticket } from '../types';

interface BacklogViewProps {
    tickets: Ticket[];
    epics: Epic[];
    onTicketClick: (ticket: Ticket) => void;
    onMoveToBoard: (ticket: Ticket) => void;
}

// WSJF: Weighted Shortest Job First - sort by (impact / effort) descending
// Impact weights: critical=4, high=3, medium=2, low=1
const IMPACT_WEIGHTS: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
};

const getImpactWeight = (impact: string): number => IMPACT_WEIGHTS[impact] || 1;

const sortTicketsByWSJF = (tickets: Ticket[]): Ticket[] => {
    return [...tickets].sort((a, b) => {
        const aImpact = getImpactWeight(a.impact);
        const bImpact = getImpactWeight(b.impact);
        const aEffort = a.effort || 1;
        const bEffort = b.effort || 1;

        // WSJF score: impact / effort (higher is better = quick wins)
        const aScore = aImpact / aEffort;
        const bScore = bImpact / bEffort;

        if (aScore !== bScore) return bScore - aScore;
        if (aImpact !== bImpact) return bImpact - aImpact;
        return aEffort - bEffort;
    });
};

export const BacklogView: React.FC<BacklogViewProps> = ({ tickets, epics, onTicketClick, onMoveToBoard }) => {

    // Sort tickets by WSJF (Impact/Effort)
    const sortedTickets = useMemo(() => sortTicketsByWSJF(tickets), [tickets]);

    const impactColor = {
        low: 'text-emerald-500',
        medium: 'text-cyan-500',
        high: 'text-amber-500',
        critical: 'text-rose-500 font-black text-glow'
    };

    const getFlagClass = (ticket: Ticket) => {
        if (ticket.flagged && ticket.requiresHuman) return 'bg-gradient-to-r from-orange-500/10 to-yellow-500/10 border-orange-500/40';
        if (ticket.flagged) return 'bg-orange-500/10 border-orange-500/40';
        if (ticket.requiresHuman) return 'bg-yellow-500/10 border-yellow-500/40';
        return 'border-cyan-900/10';
    };

    // Calculate WSJF score for display
    const getWSJFScore = (ticket: Ticket): number => {
        const impact = getImpactWeight(ticket.impact);
        const effort = ticket.effort || 1;
        return Math.round((impact / effort) * 100) / 100;
    };

    return (
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-transparent p-8">

            <div className="mb-6 flex items-center justify-between">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-500/10 border border-orange-500/20 rounded-md">
                        <Archive size={20} className="text-orange-500" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-orange-400 text-glow">Stasis Chamber // Backlog</h3>
                        <div className="flex items-center gap-2 mt-1">
                            <span className="text-[10px] text-orange-900 font-black uppercase tracking-widest">
                                {tickets.length} Units in Cryo-Sleep
                            </span>
                        </div>
                    </div>
                </div>
                <div className="text-[10px] text-cyan-900 font-black uppercase tracking-[0.2em] flex items-center gap-2">
                    <Activity size={12} /> Total Biomass Index: {tickets.reduce((acc, t) => acc + (t.effort || 0), 0)} SP
                </div>
            </div>

            {tickets.length === 0 ? (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex-1 flex flex-col items-center justify-center border border-dashed border-cyan-900/20 rounded-lg bg-cyan-950/5"
                >
                    <Database className="w-16 h-16 mb-6 text-cyan-900 opacity-30 animate-pulse" />
                    <p className="text-cyan-900 font-black uppercase tracking-[0.4em] text-sm">Chamber Decompressed</p>
                    <p className="text-[10px] mt-2 text-cyan-900/50 uppercase font-black tracking-widest">All units are currently deployed or archived.</p>
                </motion.div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-2">
                        {/* Header Row */}
                        <div className="grid grid-cols-12 gap-6 px-6 py-4 text-[10px] font-black text-cyan-800 uppercase tracking-[0.2em] border-b border-cyan-900/20">
                            <div className="col-span-4">Unit Designation</div>
                            <div className="col-span-2">Security Protocol</div>
                            <div className="col-span-2">Impact</div>
                            <div className="col-span-1 text-center">Effort</div>
                            <div className="col-span-1 text-center">WSJF</div>
                            <div className="col-span-2 text-right">Action</div>
                        </div>

                        {/* Rows */}
                        {sortedTickets.map((ticket, index) => {
                            const epic = epics.find(e => e.id === ticket.epicId);
                            const wsjfScore = getWSJFScore(ticket);
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className={`group grid grid-cols-12 gap-6 px-6 py-4 items-center bg-slate-900/20 backdrop-blur-md ${getFlagClass(ticket)} hover:bg-cyan-950/10 hover:border-cyan-500/30 transition-all rounded-md cursor-pointer relative overflow-hidden`}
                                    onClick={() => onTicketClick(ticket)}
                                >
                                    <div className="col-span-4 relative z-10">
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1.5 shrink-0">
                                                {ticket.flagged && <Flag size={11} className="text-orange-500" />}
                                                {ticket.requiresHuman && <User size={11} className="text-yellow-500" />}
                                            </div>
                                            <div className="font-black text-cyan-100 uppercase tracking-widest group-hover:text-cyan-400 transition-colors truncate">
                                                {ticket.title}
                                            </div>
                                        </div>
                                        <div className="text-[10px] text-cyan-800 uppercase font-bold tracking-tighter truncate mt-1 ml-5">
                                            {ticket.description || "NO RECORDS FOUND"}
                                        </div>
                                    </div>

                                    <div className="col-span-2 relative z-10">
                                        {epic ? (
                                            <span className="text-[9px] font-black px-2 py-1 rounded border uppercase tracking-widest" style={{ color: epic.color, borderColor: `${epic.color}40`, backgroundColor: `${epic.color}10` }}>
                                                {epic.name}
                                            </span>
                                        ) : (
                                            <span className="text-[9px] text-cyan-900 font-black tracking-widest italic">UNASSIGNED</span>
                                        )}
                                    </div>

                                    <div className={`col-span-2 text-[10px] font-black uppercase tracking-widest relative z-10 ${impactColor[ticket.impact]}`}>
                                        {ticket.impact}
                                    </div>

                                    <div className="col-span-1 flex justify-center relative z-10">
                                        {ticket.effort > 0 && (
                                            <div className="flex items-center text-[10px] font-black text-cyan-700 bg-black/40 px-2 py-0.5 rounded border border-cyan-900/30">
                                                <Hash size={10} className="mr-0.5" /> {ticket.effort}
                                            </div>
                                        )}
                                    </div>

                                    <div className="col-span-1 flex justify-center relative z-10">
                                        <div className="flex items-center text-[9px] font-black bg-black/40 px-2 py-0.5 rounded border border-cyan-900/30" style={{ color: wsjfScore >= 2 ? '#10b981' : wsjfScore >= 1 ? '#f59e0b' : '#64748b' }}>
                                            {wsjfScore}
                                        </div>
                                    </div>

                                    <div className="col-span-2 flex justify-end relative z-10">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMoveToBoard(ticket);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-cyan-500/10 hover:bg-cyan-500/20 text-cyan-400 border border-cyan-500/30 px-3 py-1.5 rounded-md text-[9px] uppercase font-black tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.1)]"
                                        >
                                            <Play size={10} className="fill-cyan-400" /> Wake Up
                                        </button>
                                    </div>

                                    {/* Row background effect */}
                                    <div className="absolute inset-0 bg-gradient-to-r from-cyan-500/0 via-cyan-500/0 to-cyan-500/0 group-hover:via-cyan-500/5 transition-all duration-500"></div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
