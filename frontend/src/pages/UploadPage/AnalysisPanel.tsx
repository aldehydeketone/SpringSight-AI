import React, { useEffect, useState, useRef } from 'react';
import { Clock, TerminalWindow, ShieldWarning } from '@phosphor-icons/react';
import { ParseResponse, AnalysisResult } from '../../types';

interface AnalysisPanelProps {
  status: 'idle' | 'processing' | 'error' | 'success';
  activeStep: number;
  selectedFile: File | null;
  parseStats: ParseResponse | null;
  analysisStats: AnalysisResult | null;
  reportId: number | null;
  onViewReport: () => void;
}

export const AnalysisPanel: React.FC<AnalysisPanelProps> = ({
  status,
  activeStep,
  selectedFile,
  parseStats,
  analysisStats,
  reportId,
  onViewReport,
}) => {
  const isRunning = status === 'processing';
  const isDone = status === 'success';
  const [renderedLogs, setRenderedLogs] = useState<any[]>([]);
  const logContainerRef = useRef<HTMLDivElement>(null);

  const timeStr = () => {
    const n = new Date();
    return (
      n.getHours().toString().padStart(2, '0') +
      ':' +
      n.getMinutes().toString().padStart(2, '0') +
      ':' +
      n.getSeconds().toString().padStart(2, '0')
    );
  };

  useEffect(() => {
    if (status === 'processing') {
      const statuses = [
        { time: timeStr(), level: 'INFO', message: 'Parser service initialized', src: 'parser.java' },
        { time: timeStr(), level: 'INFO', message: 'Mapping log sequences and offsets', src: 'sequencer.java' },
        { time: timeStr(), level: 'INFO', message: 'Scanning logs for thread contexts', src: 'thread.java' },
        { time: timeStr(), level: 'INFO', message: 'Connecting to database session', src: 'session.java' }
      ];
      setRenderedLogs(statuses.map((s, i) => ({ ...s, isNew: true, key: `proc-${i}-${Date.now()}` })));
    } else if (status === 'success' && analysisStats && analysisStats.recentErrors) {
      const mapped = analysisStats.recentErrors.map((err, i) => ({
        time: err.timestamp ? err.timestamp.split('T')[1]?.slice(0, 8) || timeStr() : timeStr(),
        level: err.level || 'ERROR',
        message: err.message || 'Exception occurred',
        src: err.logger ? err.logger.split('.').pop() || '' : 'system.java',
        isNew: true,
        key: `result-${i}-${Date.now()}`
      }));
      setRenderedLogs(mapped);
    } else if (status === 'idle') {
      setRenderedLogs([]);
    }
  }, [status, analysisStats]);

  // Auto-scroll to latest log
  useEffect(() => {
    if (logContainerRef.current && renderedLogs.length > 0) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [renderedLogs]);

  const getBadgeClass = (level: string, isNewest: boolean) => {
    const base = 'px-1.5 py-0.5 rounded text-[8.5px] font-extrabold shrink-0 border badge-interactive transition-all duration-200';
    if (level === 'ERROR' || level === 'CRITICAL') {
      return `${base} bg-red-500/10 border-red-500/20 text-red-400 ${isNewest ? 'animate-badge-glow-error' : 'shadow-[0_0_4px_rgba(239,68,68,0.08)]'}`;
    }
    if (level === 'WARN') {
      return `${base} bg-amber-500/10 border-amber-500/20 text-amber-400 ${isNewest ? 'animate-badge-glow-warn' : 'shadow-[0_0_4px_rgba(245,158,11,0.06)]'}`;
    }
    return `${base} bg-cyan-500/10 border-cyan-500/20 text-cyan-400 ${isNewest ? 'animate-badge-glow-cyan' : 'shadow-[0_0_4px_rgba(6,182,212,0.08)]'}`;
  };

  return (
    <div className="flex flex-col bg-black/40 relative overflow-hidden h-full justify-between select-none">
      <div>
        {/* Header with active processing indicator */}
        <div className="flex items-center justify-between p-3.5 border-b border-cyan-500/[0.08]">
          <div className="text-[11px] font-sans font-bold text-white/60 flex items-center gap-2 uppercase tracking-wider">
            {/* Active processing indicator */}
            {isRunning ? (
              <span className="relative w-3.5 h-3.5 flex items-center justify-center shrink-0">
                {/* Outer rotating ring */}
                <span className="absolute inset-0 rounded-full border border-cyan-500/50 border-t-cyan-400 animate-processing-ring" />
                {/* Inner pulsing dot */}
                <span className="w-1 h-1 rounded-full bg-cyan-400 shadow-[0_0_6px_rgba(6,182,212,0.8)]" />
              </span>
            ) : (
              <span className={`w-1.5 h-1.5 rounded-full ${
                isDone 
                  ? 'bg-emerald-500 shadow-[0_0_10px_rgba(52,211,153,0.8)]'
                  : 'bg-white/10'
              }`} />
            )}
            Live Ingestion Engine
            {/* Scanning sweep indicator while processing */}
            {isRunning && (
              <span className="ml-1 w-6 h-[2px] bg-gradient-to-r from-transparent via-cyan-400/60 to-transparent rounded-full animate-scan-sweep" />
            )}
          </div>
          <div className="text-[10px] text-zinc-500 font-mono">
            {isDone ? `${parseStats?.parsedEntries || 0} events` : isRunning ? 'scanning...' : '0 events'}
          </div>
        </div>

        {/* Stats bar — scaled up */}
        <div className="grid grid-cols-3 border-b border-cyan-500/[0.08] bg-zinc-950/10">
          <div className="p-2.5 border-r border-cyan-500/[0.08] flex flex-col pl-5">
            <span className="text-sm font-semibold font-mono text-cyan-400">
              {parseStats ? parseStats.totalLines.toLocaleString() : '—'}
            </span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">lines</span>
          </div>

          <div className="p-2.5 border-r border-cyan-500/[0.08] flex flex-col pl-5">
            <span className="text-sm font-semibold font-mono text-blue-400">
              {analysisStats ? (analysisStats.errorCount + analysisStats.warnCount) : '—'}
            </span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">warnings</span>
          </div>

          <div className="p-2.5 flex flex-col pl-5">
            <span className="text-sm font-semibold font-mono text-emerald-400">
              {parseStats ? parseStats.parsedEntries.toLocaleString() : '—'}
            </span>
            <span className="text-[8px] text-zinc-500 uppercase tracking-widest font-mono mt-0.5">parsed</span>
          </div>
        </div>

        {/* Stream area — with log animations */}
        <div 
          ref={logContainerRef}
          className="relative p-3.5 flex flex-col gap-1.5 min-h-[160px] max-h-[200px] overflow-y-auto scrollbar-thin scrollbar-thumb-zinc-800"
        >
          {status === 'idle' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center text-center gap-1.5 p-4 z-10 bg-black/10">
              <TerminalWindow className="h-5 w-5 text-cyan-500/20" weight="duotone" />
              <span className="text-[10px] text-zinc-500 leading-normal font-sans">
                Waiting for active log ingestion stream.<br />Drop files to process diagnostics.
              </span>
            </div>
          )}

          {renderedLogs.map((log, idx) => {
            const isLast = idx === renderedLogs.length - 1;
            return (
              <div 
                key={log.key || idx} 
                className={`flex items-center gap-2.5 text-[10px] font-mono leading-none tracking-tight py-1 px-1.5 rounded-[4px] transition-all
                  ${log.isNew ? 'animate-log-entry animate-log-glow' : ''}
                `}
                style={log.isNew ? { animationDelay: `${idx * 80}ms` } : undefined}
              >
                {/* Active log indicator — pulsing cyan left bar */}
                {isLast && (isRunning || log.isNew) ? (
                  <span className="w-[2px] h-3.5 rounded-full bg-cyan-400 animate-active-bar shrink-0" />
                ) : (
                  <span className="w-[2px] h-3.5 rounded-full bg-transparent shrink-0" />
                )}

                <span className="text-zinc-600 shrink-0 select-none">{log.time}</span>
                <span className={getBadgeClass(log.level, log.isNew && isLast)}>
                  {log.level}
                </span>
                <span className="text-zinc-400 truncate flex-1">{log.message}</span>
                <span className="text-zinc-600 shrink-0 select-none">{log.src}</span>

                {/* Blinking cursor on newest log while processing */}
                {isLast && isRunning && (
                  <span className="w-[3px] h-3 bg-cyan-400/70 rounded-sm animate-blink shrink-0 ml-0.5" />
                )}
              </div>
            );
          })}

          {isDone && renderedLogs.length === 0 && (
            <div className="flex flex-col items-center justify-center py-6 text-center text-[10px] font-mono text-emerald-400 gap-1.5">
              <ShieldWarning className="h-4 w-4 text-emerald-400 animate-pulse" weight="duotone" />
              <span>Parsing complete. No critical exceptions encountered.</span>
            </div>
          )}
        </div>
      </div>

      {/* Holographic Diagnostic Radar — scaled slightly */}
      {(isRunning || isDone) && (
        <div className="absolute bottom-5 right-5 w-20 h-20 pointer-events-none select-none z-10 flex items-center justify-center">
          {/* Outer rotating dashed ring */}
          <div className="absolute w-18 h-18 border border-dashed border-cyan-500/15 rounded-full animate-[spin_12s_linear_infinite]" />
          {/* Middle double line scanner */}
          <div className="absolute w-14 h-14 border border-double border-blue-500/20 rounded-full animate-[spin_8s_linear_infinite_reverse]" />
          {/* Pulse center core */}
          <div className="absolute w-9 h-9 bg-cyan-500/5 border border-cyan-400/25 rounded-full flex items-center justify-center">
            <span className="h-1.5 w-1.5 bg-cyan-400 rounded-full animate-ping" />
          </div>
          {/* Sweeper */}
          <div 
            className="absolute w-14 h-14 rounded-full animate-[spin_4s_linear_infinite]"
            style={{ backgroundImage: 'conic-gradient(from 0deg, rgba(6,182,212,0.12), transparent 60%)' }}
          />
        </div>
      )}

      {/* Navigation bottom bar */}
      {isDone && reportId && (
        <div className="p-2.5 border-t border-cyan-500/[0.08] bg-zinc-950/20 flex justify-end shrink-0 z-20">
          <button
            onClick={onViewReport}
            className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 text-black hover:from-blue-400 hover:to-cyan-400 rounded transition-all shadow-[0_0_16px_rgba(6,182,212,0.3)] cursor-pointer hover:scale-[1.01] hover:shadow-[0_0_24px_rgba(6,182,212,0.4)]"
          >
            View Report
          </button>
        </div>
      )}
    </div>
  );
};
export default AnalysisPanel;
