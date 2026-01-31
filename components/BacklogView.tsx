import { motion } from 'framer-motion';
import { Activity, Archive, Database, Flag, Hash, Play, User, ChevronDown, ChevronRight } from 'lucide-react';
import React, { useMemo, useState } from 'react';
import { Epic, Ticket } from '../types';

interface BacklogViewProps {
    tickets: Ticket[];
    epics: Epic[];
    onTicketClick: (ticket: Ticket) => void;
    onMoveToBoard: (ticket: Ticket) => void;
}

// Impact weights for priority sorting
const IMPACT_WEIGHTS: Record<string, number> = {
    critical: 4,
    high: 3,
    medium: 2,
    low: 1
};

const getImpactWeight = (impact: string): number => IMPACT_WEIGHTS[impact] || 1;

// Sort tickets by priority (impact), then by start/end date
const sortTicketsByPriority = (tickets: Ticket[]): Ticket[] => {
    return [...tickets].sort((a, b) => {
        const aImpact = getImpactWeight(a.impact);
        const bImpact = getImpactWeight(b.impact);

        // Sort by impact (higher first)
        if (aImpact !== bImpact) return bImpact - aImpact;

        // Same impact - sort by start date
        if (a.startDate && b.startDate) {
            const startCompare = new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
            if (startCompare !== 0) return startCompare;
        }
        if (a.startDate) return -1;
        if (b.startDate) return 1;

        // Same impact, no start date - sort by end date
        if (a.endDate && b.endDate) {
            return new Date(a.endDate).getTime() - new Date(b.endDate).getTime();
        }
        if (a.endDate) return -1;
        if (b.endDate) return 1;

        // Same impact, no dates - maintain position order
        return (a.position || 0) - (b.position || 0);
    });
};

// Group tickets by epic
interface EpicGroup {
    epic: Epic | null;
    tickets: Ticket[];
    totalEffort: number;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ tickets, epics, onTicketClick, onMoveToBoard }) => {
    const [collapsedEpics, setCollapsedEpics] = useState<Set<string>>(new Set());

    const toggleEpic = (epicId: string) => {
        setCollapsedEpics(prev => {
            const next = new Set(prev);
            if (next.has(epicId)) {
                next.delete(epicId);
            } else {
                next.add(epicId);
            }
            return next;
        });
    };

    // Group and sort tickets by epic
    const epicGroups = useMemo(() => {
        const groups: EpicGroup[] = [];

        // Sort epics by name
        const sortedEpics = [...epics].sort((a, b) => a.name.localeCompare(b.name));

        // Create groups for each epic
        for (const epic of sortedEpics) {
            const epicTickets = tickets.filter(t => t.epicId === epic.id);
            if (epicTickets.length > 0) {
                const sortedTickets = sortTicketsByPriority(epicTickets);
                groups.push({
                    epic,
                    tickets: sortedTickets,
                    totalEffort: sortedTickets.reduce((acc, t) => acc + (t.effort || 0), 0)
                });
            }
        }

        // Add unassigned group
        const unassignedTickets = tickets.filter(t => !t.epicId);
        if (unassignedTickets.length > 0) {
            const sortedTickets = sortTicketsByPriority(unassignedTickets);
            groups.push({
                epic: null,
                tickets: sortedTickets,
                totalEffort: sortedTickets.reduce((acc, t) => acc + (t.effort || 0), 0)
            });
        }

        return groups;
    }, [tickets, epics]);

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

    // Get epic key for collapse state
    const getEpicKey = (epic: Epic | null): string => epic?.id || 'unassigned';

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
                    <div className="space-y-6">
                        {epicGroups.map((group, groupIndex) => {
                            const epicKey = getEpicKey(group.epic);
                            const isCollapsed = collapsedEpics.has(epicKey);

                            return (
                                <motion.div
                                    key={epicKey}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: groupIndex * 0.05 }}
                                >
                                    {/* Epic Header */}
                                    <div
                                        className="flex items-center gap-3 px-4 py-3 bg-slate-900/40 backdrop-blur-md border border-cyan-900/20 rounded-t-lg cursor-pointer hover:bg-cyan-950/20 transition-all"
                                        onClick={() => toggleEpic(epicKey)}
                                    >
                                        {isCollapsed ? (
                                            <ChevronRight size={16} className="text-cyan-700" />
                                        ) : (
                                            <ChevronDown size={16} className="text-cyan-700" />
                                        )}
                                        {group.epic ? (
                                            <>
                                                <div
                                                    className="w-3 h-3 rounded-full"
                                                    style={{ backgroundColor: group.epic.color }}
                                                />
                                                <span className="text-xs font-black uppercase tracking-widest" style={{ color: group.epic.color }}>
                                                    {group.epic.name}
                                                </span>
                                            </>
                                        ) : (
                                            <span className="text-xs font-black uppercase tracking-widest text-cyan-700 italic">
                                                UNASSIGNED
                                            </span>
                                        )}
                                        <div className="flex items-center gap-3 ml-auto">
                                            <span className="text-[10px] text-cyan-800 font-black uppercase tracking-widest">
                                                {group.tickets.length} UNITS
                                            </span>
                                            <div className="text-[10px] text-cyan-800 font-black uppercase tracking-widest flex items-center gap-1">
                                                <Hash size={10} /> {group.totalEffort} SP
                                            </div>
                                        </div>
                                    </div>

                                    {/* Epic Tickets */}
                                    {!isCollapsed && (
                                        <motion.div
                                            initial={{ opacity: 0, height: 0 }}
                                            animate={{ opacity: 1, height: 'auto' }}
                                            exit={{ opacity: 0, height: 0 }}
                                            className="border border-t-0 border-cyan-900/10 rounded-b-lg overflow-hidden"
                                        >
                                            {/* Header Row */}
                                            <div className="grid grid-cols-11 gap-6 px-6 py-3 text-[10px] font-black text-cyan-800 uppercase tracking-[0.2em] border-b border-cyan-900/10 bg-slate-900/20">
                                                <div className="col-span-4">Unit Designation</div>
                                                <div className="col-span-2">Impact</div>
                                                <div className="col-span-1 text-center">Effort</div>
                                                <div className="col-span-1 text-center">WSJF</div>
                                                <div className="col-span-3 text-right">Action</div>
                                            </div>

                                            {/* Ticket Rows */}
                                            <div className="divide-y divide-cyan-900/5">
                                                {group.tickets.map((ticket) => {
                                                    const wsjfScore = getWSJFScore(ticket);
                                                    return (
                                                        <motion.div
                                                            key={ticket.id}
                                                            initial={{ opacity: 0, x: -10 }}
                                                            animate={{ opacity: 1, x: 0 }}
                                                            className={`group grid grid-cols-11 gap-6 px-6 py-3 items-center bg-slate-900/10 hover:bg-cyan-950/10 transition-all cursor-pointer relative overflow-hidden ${getFlagClass(ticket)}`}
                                                            onClick={() => onTicketClick(ticket)}
                                                        >
                                                            <div className="col-span-4 relative z-10">
                                                                <div className="flex items-center gap-2">
                                                                    <div className="flex items-center gap-1.5 shrink-0">
                                                                        {ticket.flagged && <Flag size={11} className="text-orange-500" />}
                                                                        {ticket.requiresHuman && <User size={11} className="text-yellow-500" />}
                                                                    </div>
                                                                    <div className="font-black text-cyan-100 uppercase tracking-widest group-hover:text-cyan-400 transition-colors truncate text-[11px]">
                                                                        {ticket.title}
                                                                    </div>
                                                                </div>
                                                                <div className="text-[9px] text-cyan-800 uppercase font-bold tracking-tighter truncate mt-0.5 ml-5">
                                                                    {ticket.description || "NO RECORDS FOUND"}
                                                                </div>
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

                                                            <div className="col-span-3 flex justify-end relative z-10">
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
                                        </motion.div>
                                    )}
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
