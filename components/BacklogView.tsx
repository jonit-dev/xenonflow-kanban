import { motion } from 'framer-motion';
import { Archive, Database, Play } from 'lucide-react';
import React from 'react';
import { Epic, Ticket } from '../types';

interface BacklogViewProps {
    tickets: Ticket[];
    epics: Epic[];
    onTicketClick: (ticket: Ticket) => void;
    onMoveToBoard: (ticket: Ticket) => void;
}

export const BacklogView: React.FC<BacklogViewProps> = ({ tickets, epics, onTicketClick, onMoveToBoard }) => {

    const priorityColor = {
        low: 'text-slate-600',
        medium: 'text-cyan-600',
        high: 'text-orange-500',
        critical: 'text-rose-500 font-black glow-rose'
    };

    return (
        <div className="flex-1 h-full overflow-hidden flex flex-col bg-transparent p-8 font-mono">

            <div className="mb-6 flex items-center justify-between bg-slate-950/40 p-4 border border-cyan-900/30 rounded-lg backdrop-blur-md">
                <div className="flex items-center gap-4">
                    <div className="p-2 bg-orange-500/10 rounded border border-orange-500/20">
                        <Archive size={20} className="text-orange-500 animate-pulse" />
                    </div>
                    <div>
                        <h3 className="text-sm font-black uppercase tracking-[0.3em] text-cyan-100">Stasis Chamber</h3>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] text-orange-700 font-black uppercase tracking-widest">
                                {tickets.length} Units in Deep Sleep
                            </span>
                            <div className="w-1 h-1 bg-cyan-900 rounded-full"></div>
                            <span className="text-[10px] text-cyan-900 font-bold uppercase tracking-widest">
                                Biomass: {tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0)} Units
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {tickets.length === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center text-cyan-900 border border-dashed border-cyan-900/30 rounded-xl bg-slate-900/10 backdrop-blur-sm">
                    <Database className="w-20 h-20 mb-6 opacity-10 animate-pulse" />
                    <p className="font-black uppercase tracking-[0.5em] text-sm">Chamber Decompressed</p>
                    <p className="text-[10px] mt-2 opacity-50 uppercase font-bold tracking-widest">All units are currently deployed to operational sectors.</p>
                </div>
            ) : (
                <div className="flex-1 overflow-y-auto pr-4 custom-scrollbar">
                    <div className="space-y-2">
                        {/* Header */}
                        <div className="grid grid-cols-12 gap-6 px-6 py-4 text-[10px] font-black text-cyan-800 uppercase tracking-[0.2em] border-b border-cyan-900/20 sticky top-0 bg-slate-950/60 backdrop-blur-md z-10">
                            <div className="col-span-5">Unit Designation</div>
                            <div className="col-span-2">Protocol ID</div>
                            <div className="col-span-2 text-center">Threat Level</div>
                            <div className="col-span-1 text-center">Complexity</div>
                            <div className="col-span-2 text-right">Containment</div>
                        </div>

                        {/* Rows */}
                        {tickets.map((ticket, idx) => {
                            const epic = epics.find(e => e.id === ticket.epicId);
                            return (
                                <motion.div
                                    initial={{ opacity: 0, y: 10, x: -10 }}
                                    animate={{ opacity: 1, y: 0, x: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    key={ticket.id}
                                    className="group grid grid-cols-12 gap-6 px-6 py-5 items-center bg-slate-900/20 border border-cyan-900/10 hover:bg-cyan-500/10 hover:border-cyan-500/30 transition-all rounded-lg cursor-pointer backdrop-blur-sm"
                                    onClick={() => onTicketClick(ticket)}
                                >
                                    <div className="col-span-5">
                                        <div className="text-[11px] font-black text-cyan-100 group-hover:text-cyan-400 transition-colors truncate uppercase tracking-widest">
                                            {ticket.title}
                                        </div>
                                        <div className="text-[9px] text-cyan-900 font-bold truncate mt-1 uppercase tracking-wider">{ticket.description || "NO DATA"}</div>
                                    </div>

                                    <div className="col-span-2">
                                        {epic ? (
                                            <span className="text-[9px] font-black px-2 py-1 rounded border uppercase tracking-tighter" style={{ color: epic.color, borderColor: `${epic.color}30`, backgroundColor: `${epic.color}05` }}>
                                                {epic.name}
                                            </span>
                                        ) : (
                                            <span className="text-[10px] text-cyan-950 font-black">-</span>
                                        )}
                                    </div>

                                    <div className={`col-span-2 text-[10px] font-black uppercase tracking-[0.1em] text-center ${priorityColor[ticket.priority]}`}>
                                        {ticket.priority}
                                    </div>

                                    <div className="col-span-1 flex justify-center">
                                        {ticket.storyPoints > 0 ? (
                                            <div className="flex items-center text-[10px] font-black text-cyan-700 bg-black/40 px-2 py-1 rounded border border-cyan-900/30">
                                                {ticket.storyPoints}
                                            </div>
                                        ) : (
                                            <span className="text-cyan-950">-</span>
                                        )}
                                    </div>

                                    <div className="col-span-2 flex justify-end">
                                        <button
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                onMoveToBoard(ticket);
                                            }}
                                            className="opacity-0 group-hover:opacity-100 transition-all flex items-center gap-2 bg-cyan-500/20 hover:bg-cyan-500/40 text-cyan-400 border border-cyan-500/50 px-4 py-2 rounded text-[9px] uppercase font-black tracking-widest shadow-[0_0_15px_rgba(6,182,212,0.2)]"
                                        >
                                            <Play size={10} fill="currentColor" /> Deploy
                                        </button>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                </div>
            )}
        </div>
    );
};
