import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Pulse,
  CloudArrowUp,
  ClockCounterClockwise,
  GearSix,
  Sparkle,
  MagnifyingGlass,
  X,
  ArrowElbowDownLeft,
  ArrowsDownUp,
  FileCode,
} from '@phosphor-icons/react';

interface CommandItem {
  id: string;
  name: string;
  category: 'Navigation' | 'Actions' | 'Tools';
  path: string;
  icon: React.ReactNode;
  shortcut?: string;
}

export const CommandSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands: CommandItem[] = [
    { id: '1', name: 'AI Log Analysis', category: 'Navigation', path: '/dashboard', icon: <Pulse className="h-4 w-4" weight="duotone" /> },
    { id: '2', name: 'Upload & Parse Logs', category: 'Navigation', path: '/upload', icon: <CloudArrowUp className="h-4 w-4" weight="duotone" /> },
    { id: '3', name: 'Analysis History & Reports', category: 'Navigation', path: '/reports', icon: <ClockCounterClockwise className="h-4 w-4" weight="duotone" /> },
    { id: '4', name: 'Settings & API Keys', category: 'Navigation', path: '/settings', icon: <GearSix className="h-4 w-4" weight="duotone" /> },
    { id: '5', name: 'Run Quick Log Diagnostics', category: 'Actions', path: '/upload', icon: <Sparkle className="h-4 w-4 text-cyan-400" weight="fill" /> },
    { id: '6', name: 'Export Latest Incident Report', category: 'Actions', path: '/reports', icon: <FileCode className="h-4 w-4 text-emerald-400" weight="duotone" /> },
  ];

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % Math.max(1, filtered.length));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % Math.max(1, filtered.length));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          navigate(filtered[selectedIndex].path);
          setIsOpen(false);
        }
      } else if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, selectedIndex, filtered, navigate]);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      setSearch('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.15 }}
          onClick={() => setIsOpen(false)}
          className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-start justify-center pt-28 px-4 z-50 font-sans"
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.96, y: -10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96, y: -10 }}
            transition={{ type: 'spring', stiffness: 450, damping: 32 }}
            onClick={(e) => e.stopPropagation()}
            className="bg-[#0b0f19] border border-cyan-500/25 w-full max-w-xl rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.15)] overflow-hidden flex flex-col"
          >
            {/* Search Input Bar */}
            <div className="flex items-center px-4 py-3.5 border-b border-white/[0.08] bg-[#0d1220]">
              <MagnifyingGlass className="h-4 w-4 text-cyan-400 mr-3 shrink-0" weight="bold" />
              <input
                ref={inputRef}
                type="text"
                placeholder="Search actions, logs, pages, or commands..."
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setSelectedIndex(0);
                }}
                className="flex-1 bg-transparent text-sm text-slate-100 placeholder-slate-500 focus:outline-none"
              />
              <button
                onClick={() => setIsOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-md hover:bg-white/[0.06] transition-colors cursor-pointer"
              >
                <X className="h-4 w-4" weight="bold" />
              </button>
            </div>

            {/* Commands List */}
            <div className="p-2.5 max-h-80 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
              {filtered.length === 0 ? (
                <div className="py-10 text-center text-xs text-slate-500">
                  No matching commands found.
                </div>
              ) : (
                filtered.map((cmd, i) => {
                  const isSelected = i === selectedIndex;
                  return (
                    <button
                      key={cmd.id}
                      onClick={() => {
                        navigate(cmd.path);
                        setIsOpen(false);
                      }}
                      onMouseEnter={() => setSelectedIndex(i)}
                      className={`w-full flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs text-left cursor-pointer transition-all duration-150 ${
                        isSelected
                          ? 'bg-cyan-500/15 text-white border border-cyan-500/30 shadow-[0_0_12px_rgba(6,182,212,0.15)]'
                          : 'text-slate-400 hover:text-slate-200 border border-transparent'
                      }`}
                    >
                      <span className={`shrink-0 ${isSelected ? 'text-cyan-400' : 'text-slate-500'}`}>
                        {cmd.icon}
                      </span>
                      <span className="flex-1 font-medium truncate">{cmd.name}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded bg-white/[0.04] text-slate-400 border border-white/[0.06]">
                        {cmd.category}
                      </span>
                      {isSelected && (
                        <span className="text-[10px] text-cyan-400 font-mono flex items-center gap-1">
                          <ArrowElbowDownLeft className="h-3 w-3" weight="bold" />
                        </span>
                      )}
                    </button>
                  );
                })
              )}
            </div>

            {/* Footer */}
            <div className="border-t border-white/[0.06] px-4 py-2.5 bg-[#080c14] flex items-center justify-between text-[10px] text-slate-400 font-medium">
              <div className="flex items-center gap-3">
                <span className="flex items-center gap-1">
                  <ArrowsDownUp className="h-3 w-3 text-slate-400" weight="bold" /> Navigate
                </span>
                <span className="flex items-center gap-1">
                  <ArrowElbowDownLeft className="h-3 w-3 text-slate-400" weight="bold" /> Open
                </span>
              </div>
              <span className="font-mono text-slate-400 bg-slate-800/80 px-1.5 py-0.5 rounded border border-slate-700/50">
                ESC to close
              </span>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

