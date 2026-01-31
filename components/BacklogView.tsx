import { motion } from 'framer-motion';
import { Activity, Archive, Database, Hash, Play } from 'lucide-react';
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
        low: 'text-slate-500',
        medium: 'text-cyan-600',
        high: 'text-orange-500',
        critical: 'text-rose-500 font-black text-glow'
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
                    <Activity size={12} /> Total Biomass Index: {tickets.reduce((acc, t) => acc + (t.storyPoints || 0), 0)} SP
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
                            <div className="col-span-5">Unit Designation</div>
                            <div className="col-span-2">Security Protocol</div>
                            <div className="col-span-2">Hazard Level</div>
                            <div className="col-span-1 text-center">Complexity</div>
                            <div className="col-span-2 text-right">System Action</div>
                        </div>

                        {/* Rows */}
                        {tickets.map((ticket, index) => {
                            const epic = epics.find(e => e.id === ticket.epicId);
                            return (
                                <motion.div
                                    key={ticket.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.05 }}
                                    className="group grid grid-cols-12 gap-6 px-6 py-4 items-center bg-slate-900/20 backdrop-blur-md border border-cyan-900/10 hover:bg-cyan-950/10 hover:border-cyan-500/30 transition-all rounded-md cursor-pointer relative overflow-hidden"
                                    onClick={() => onTicketClick(ticket)}
                                >
                                    <div className="col-span-5 relative z-10">
                                        <div className="font-black text-cyan-100 uppercase tracking-widest group-hover:text-cyan-400 transition-colors truncate">
                                            {ticket.title}
                                        </div>
                                        <div className="text-[10px] text-cyan-800 uppercase font-bold tracking-tighter truncate mt-1">
                                            Log Fragment: {ticket.description || "NO RECORDS FOUND"}
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

                                    <div className={`col-span-2 text-[10px] font-black uppercase tracking-widest relative z-10 ${priorityColor[ticket.priority]}`}>
                                        {ticket.priority}
                                    </div>

                                    <div className="col-span-1 flex justify-center relative z-10">
                                        {ticket.storyPoints > 0 && (
                                            <div className="flex items-center text-[10px] font-black text-cyan-700 bg-black/40 px-2 py-0.5 rounded border border-cyan-900/30">
                                                <Hash size={10} className="mr-0.5" /> {ticket.storyPoints}
                                            </div>
                                        )}
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
