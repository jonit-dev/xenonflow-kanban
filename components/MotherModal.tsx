import { AnimatePresence, motion } from 'framer-motion';
import { Activity, BrainCircuit, Terminal, X } from 'lucide-react';
import React, { useEffect, useState } from 'react';
import { Button } from './ui/Button';

interface MotherModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  isLoading?: boolean;
}

const TypewriterText: React.FC<{ text: string }> = ({ text }) => {
  const [displayedText, setDisplayedText] = useState('');

  useEffect(() => {
    setDisplayedText('');
    let i = 0;
    const interval = setInterval(() => {
      setDisplayedText((prev) => prev + text.charAt(i));
      i++;
      if (i >= text.length) clearInterval(interval);
    }, 10);
    return () => clearInterval(interval);
  }, [text]);

  return <span>{displayedText}</span>;
};

export const MotherModal: React.FC<MotherModalProps> = ({
  isOpen,
  onClose,
  content,
  title = "MOTHER INTERFACE",
  isLoading
}) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/90 backdrop-blur-md"
            onClick={onClose}
          />

          {/* Content */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="relative w-full max-w-2xl bg-slate-950/80 border border-cyan-500/40 shadow-[0_0_100px_rgba(6,182,212,0.2)] overflow-hidden rounded-lg font-mono"
          >
            {/* Scanline Effect inside modal */}
            <div className="absolute inset-0 pointer-events-none opacity-20 overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-[2px] bg-cyan-500/40 animate-[scan_3s_linear_infinite]"></div>
            </div>

            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-cyan-500/30 bg-cyan-950/20">
              <div className="flex items-center gap-4">
                <div className="p-2 bg-cyan-500/20 rounded">
                  <BrainCircuit className="w-6 h-6 text-cyan-400 animate-pulse" />
                </div>
                <div>
                  <h2 className="text-sm font-black uppercase tracking-[0.4em] text-cyan-100 text-glow">{title}</h2>
                  <div className="text-[10px] text-cyan-700 font-bold tracking-widest uppercase mt-1 flex items-center gap-2">
                    <Activity size={10} className="animate-pulse" /> Secure Connection Active
                  </div>
                </div>
              </div>
              <button onClick={onClose} className="text-slate-500 hover:text-cyan-400 transition-colors p-2 hover:bg-cyan-500/10 rounded">
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Body */}
            <div className="p-8 min-h-[300px] max-h-[60vh] overflow-y-auto custom-scrollbar">
              {isLoading ? (
                <div className="flex flex-col items-center justify-center h-full py-12 space-y-6">
                  <div className="relative">
                    <div className="w-20 h-20 border-2 border-cyan-500/10 rounded-full"></div>
                    <div className="absolute inset-0 border-t-2 border-cyan-400 rounded-full animate-spin"></div>
                    <div className="absolute inset-4 border-b-2 border-purple-500 rounded-full animate-[spin_2s_linear_infinite_reverse]"></div>
                  </div>
                  <div className="text-center">
                    <p className="text-cyan-400 text-xs font-black tracking-[0.3em] uppercase animate-pulse">Establishing Neural Link</p>
                    <p className="text-[10px] text-cyan-800 mt-1 uppercase font-bold tracking-widest">Querying Hive Mind...</p>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute -left-4 top-0 bottom-0 w-1 bg-cyan-500/10"></div>
                  <div className="text-cyan-100 text-sm leading-relaxed whitespace-pre-wrap uppercase tracking-wider font-medium">
                    <TypewriterText text={content || "NO DATA RETURNED FROM SECTOR CORE."} />
                  </div>
                </div>
              )}
            </div>

            {/* Footer */}
            <div className="p-6 border-t border-cyan-500/30 bg-slate-950/40 flex justify-between items-center">
              <div className="flex gap-2">
                <Terminal size={14} className="text-cyan-800" />
                <span className="text-[10px] text-cyan-800 font-black uppercase tracking-widest">Protocol MU-TH-UR 6000</span>
              </div>
              <Button onClick={onClose} className="mother-btn px-8 py-2 font-black text-[10px] tracking-[0.2em]">
                ACKNOWLEDGE
              </Button>
            </div>

            {/* Decorative corner accents */}
            <div className="absolute top-0 left-0 w-4 h-4 border-t-2 border-l-2 border-cyan-400/50"></div>
            <div className="absolute top-0 right-0 w-4 h-4 border-t-2 border-r-2 border-cyan-400/50"></div>
            <div className="absolute bottom-0 left-0 w-4 h-4 border-b-2 border-l-2 border-cyan-400/50"></div>
            <div className="absolute bottom-0 right-0 w-4 h-4 border-b-2 border-r-2 border-cyan-400/50"></div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
};
