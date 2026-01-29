import React from 'react';
import { X, BrainCircuit } from 'lucide-react';
import { Button } from './ui/Button';

interface MotherModalProps {
  isOpen: boolean;
  onClose: () => void;
  content: string;
  title?: string;
  isLoading?: boolean;
}

export const MotherModal: React.FC<MotherModalProps> = ({ 
  isOpen, 
  onClose, 
  content, 
  title = "Hive Mind Transmission",
  isLoading 
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/80 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Content */}
      <div className="relative w-full max-w-2xl bg-slate-950 border border-cyan-500/30 shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden animate-in fade-in zoom-in duration-300">
        
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-cyan-500/20 bg-cyan-950/20">
          <div className="flex items-center gap-3 text-cyan-400">
            <BrainCircuit className="w-6 h-6 animate-pulse" />
            <h2 className="text-lg font-bold uppercase tracking-widest">{title}</h2>
          </div>
          <button onClick={onClose} className="text-slate-500 hover:text-cyan-400 transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 min-h-[200px] max-h-[70vh] overflow-y-auto">
          {isLoading ? (
            <div className="flex flex-col items-center justify-center h-full py-12 space-y-4">
              <div className="w-16 h-16 border-4 border-cyan-500/30 border-t-cyan-400 rounded-full animate-spin"></div>
              <p className="text-cyan-500/70 text-sm animate-pulse">ESTABLISHING NEURAL LINK...</p>
            </div>
          ) : (
            <div className="prose prose-invert prose-p:text-slate-300 prose-headings:text-cyan-400 max-w-none">
              <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed">
                {content}
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-cyan-500/20 bg-slate-950 flex justify-end">
          <Button onClick={onClose} variant="primary">
            Acknowledge
          </Button>
        </div>

        {/* Decorative corner accents */}
        <div className="absolute top-0 left-0 w-2 h-2 border-t border-l border-cyan-500"></div>
        <div className="absolute top-0 right-0 w-2 h-2 border-t border-r border-cyan-500"></div>
        <div className="absolute bottom-0 left-0 w-2 h-2 border-b border-l border-cyan-500"></div>
        <div className="absolute bottom-0 right-0 w-2 h-2 border-b border-r border-cyan-500"></div>
      </div>
    </div>
  );
};
