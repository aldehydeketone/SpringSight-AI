import React, { useEffect, useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Monitor, Upload, FileText, Settings, Sparkles, X, Terminal } from 'lucide-react';

export const CommandSearch: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const navigate = useNavigate();
  const inputRef = useRef<HTMLInputElement>(null);

  const commands = [
    { name: 'Open Dashboard', path: '/dashboard', icon: <Monitor className="h-4 w-4" /> },
    { name: 'Open Upload Page', path: '/upload', icon: <Upload className="h-4 w-4" /> },
    { name: 'Search Reports', path: '/reports', icon: <Search className="h-4 w-4" /> },
    { name: 'Settings', path: '/settings', icon: <Settings className="h-4 w-4" /> },
    { name: 'Run Analysis', path: '/upload', icon: <Sparkles className="h-4 w-4" /> },
    { name: 'View Recent Reports', path: '/reports', icon: <FileText className="h-4 w-4" /> },
  ];

  const filtered = commands.filter((c) =>
    c.name.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      }
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % filtered.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + filtered.length) % filtered.length);
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

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-start justify-center pt-24 z-50 font-sans">
      <div className="bg-[#12121a] border border-[#1e293b] w-full max-w-lg rounded-xl shadow-2xl overflow-hidden flex flex-col mx-4 animate-in fade-in zoom-in-95 duration-150">
        {/* Input bar */}
        <div className="flex items-center px-4 py-3 border-b border-[#1e293b] bg-[#161622]">
          <Search className="h-5 w-5 text-[#94a3b8] mr-3" />
          <input
            ref={inputRef}
            type="text"
            placeholder="Type a command or search... (Esc to close)"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setSelectedIndex(0);
            }}
            className="flex-1 bg-transparent text-sm text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:outline-none"
          />
          <button
            onClick={() => setIsOpen(false)}
            className="text-[#94a3b8]/60 hover:text-white transition-colors cursor-pointer"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Commands list */}
        <div className="p-2 max-h-72 overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="py-8 text-center text-xs text-[#94a3b8] italic">
              No commands found.
            </div>
          ) : (
            filtered.map((cmd, i) => (
              <button
                key={cmd.name}
                onClick={() => {
                  navigate(cmd.path);
                  setIsOpen(false);
                }}
                className={`w-full flex items-center px-4 py-2.5 rounded-lg text-xs text-left cursor-pointer transition-colors ${
                  i === selectedIndex
                    ? 'bg-blue-600/20 text-blue-400 border border-blue-500/30'
                    : 'text-[#94a3b8] hover:bg-[#1a1a2e] border border-transparent'
                }`}
              >
                <span className="mr-3 text-[#94a3b8]">{cmd.icon}</span>
                <span className="flex-1 font-medium">{cmd.name}</span>
                <span className="text-[10px] text-[#94a3b8]/40 flex items-center gap-1 font-mono">
                  <Terminal className="h-3 w-3" />
                  Select
                </span>
              </button>
            ))
          )}
        </div>

        {/* Footer */}
        <div className="border-t border-[#1e293b] px-4 py-2.5 bg-[#0a0a0f] flex items-center justify-between text-[10px] text-[#94a3b8]/50">
          <div className="flex items-center space-x-3">
            <span>↑↓ Navigate</span>
            <span>↵ Select</span>
          </div>
          <span>ctrl + k</span>
        </div>
      </div>
    </div>
  );
};
