import React from 'react';

interface ConsolePanelProps {
  statusText: string;
  status: 'idle' | 'processing' | 'error' | 'success';
}

export const ConsolePanel: React.FC<ConsolePanelProps> = ({
  statusText,
  status
}) => {
  return (
    <div className="border-t border-cyan-500/[0.08] px-5 py-2 bg-black/40 font-mono text-[10px] flex items-center gap-2.5 min-h-[30px] relative z-10 shrink-0">
      <div className={`w-2 h-2 rounded-full shrink-0 transition-all duration-300 ${
        status === 'processing' 
          ? 'bg-cyan-400 shadow-[0_0_8px_2px_rgba(34,211,238,0.6)] animate-pulse'
          : status === 'success'
          ? 'bg-emerald-400 shadow-[0_0_8px_2px_rgba(52,211,153,0.6)]'
          : status === 'error'
          ? 'bg-red-400 shadow-[0_0_8px_2px_rgba(239,68,68,0.6)]'
          : 'bg-cyan-500/50 shadow-[0_0_5px_rgba(6,182,212,0.3)]'
      }`} />
      
      <span className="text-cyan-400/80 flex-1 select-none font-medium tracking-tight">
        {statusText}
      </span>
      
      {/* Terminal cursor — only visible while processing */}
      {status === 'processing' && (
        <span className="w-[3px] h-3 bg-cyan-400/70 animate-blink rounded-sm" />
      )}
    </div>
  );
};
export default ConsolePanel;
