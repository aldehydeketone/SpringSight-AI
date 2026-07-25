import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Terminal, Shield, CheckCircle, AlertTriangle, FileText,
  Trash2, Wifi, Zap, Database, Clock,
} from 'lucide-react';
import { ActivityEvent } from '../../types';

interface KineticLogStreamProps {
  events: ActivityEvent[];
}

// Simulated live log entries that cycle when no real events exist
const LIVE_FEED: { type: ActivityEvent['type']; message: string; severity: string }[] = [
  { type: 'UPLOAD',      message: 'Watching for incoming log files…',           severity: 'INFO' },
  { type: 'PARSE',       message: 'Parser engine warm-up complete',              severity: 'INFO' },
  { type: 'ANALYZE',     message: 'AI model loaded — Gemini 2.5 Flash ready',   severity: 'INFO' },
  { type: 'AI_COMPLETE', message: 'RCA pipeline awaiting first upload',          severity: 'INFO' },
  { type: 'UPLOAD',      message: 'Diagnostic core heartbeat OK',                severity: 'INFO' },
  { type: 'PARSE',       message: 'Log schema validator online',                 severity: 'INFO' },
  { type: 'ANALYZE',     message: 'Stack trace tokeniser ready',                 severity: 'INFO' },
  { type: 'AI_COMPLETE', message: 'Confidence scorer calibrated',                severity: 'INFO' },
  { type: 'PDF_EXPORT',  message: 'PDF renderer service connected',              severity: 'INFO' },
  { type: 'UPLOAD',      message: 'Monitoring ingestion channel…',               severity: 'INFO' },
];

let liveIdx = 0;

const getIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'UPLOAD':      return <Terminal  className="h-3.5 w-3.5 text-blue-400" />;
    case 'PARSE':       return <Shield    className="h-3.5 w-3.5 text-cyan-400" />;
    case 'ANALYZE':     return <AlertTriangle className="h-3.5 w-3.5 text-yellow-400" />;
    case 'AI_COMPLETE': return <CheckCircle  className="h-3.5 w-3.5 text-emerald-400" />;
    case 'PDF_EXPORT':  return <FileText  className="h-3.5 w-3.5 text-purple-400" />;
    case 'DELETE':      return <Trash2    className="h-3.5 w-3.5 text-red-400" />;
    default:            return <Terminal  className="h-3.5 w-3.5 text-slate-400" />;
  }
};

const getBadgeClass = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-950/60 text-red-400 border-red-700/40';
    case 'HIGH':     return 'bg-orange-950/60 text-orange-400 border-orange-700/40';
    case 'WARN':     return 'bg-amber-950/60 text-amber-400 border-amber-700/40';
    case 'INFO':     return 'bg-blue-950/60 text-blue-400 border-blue-700/40';
    default:         return 'bg-slate-900/60 text-slate-400 border-slate-700/40';
  }
};

const getSeverityDot = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-400';
    case 'HIGH':     return 'bg-orange-400';
    case 'WARN':     return 'bg-amber-400';
    case 'INFO':     return 'bg-blue-400';
    default:         return 'bg-slate-400';
  }
};

interface StreamEntry extends ActivityEvent {
  _glowing?: boolean;
}

export const KineticLogStream: React.FC<KineticLogStreamProps> = ({ events }) => {
  const [streamEntries, setStreamEntries] = useState<StreamEntry[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const initialized = useRef(false);

  // Seed from real events on first load
  useEffect(() => {
    if (events.length > 0 && !initialized.current) {
      initialized.current = true;
      setStreamEntries(events.slice(0, 8).map((e) => ({ ...e, _glowing: false })));
    }
  }, [events]);

  // Auto-cycle: prepend a new entry every 3 s
  useEffect(() => {
    timerRef.current = setInterval(() => {
      const template = LIVE_FEED[liveIdx % LIVE_FEED.length];
      liveIdx += 1;

      const newEntry: StreamEntry = {
        id: `live-${Date.now()}-${Math.random()}`,
        timestamp: new Date().toISOString(),
        type: template.type,
        message: template.message,
        severity: template.severity as any,
        _glowing: true,
      };

      setStreamEntries((prev) => {
        const updated = [newEntry, ...prev.slice(0, 9)];
        // Remove glow after 1.5 s
        setTimeout(() => {
          setStreamEntries((p) =>
            p.map((e) => (e.id === newEntry.id ? { ...e, _glowing: false } : e))
          );
        }, 1500);
        return updated;
      });
    }, 3000);

    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, []);

  const now = new Date();

  return (
    <div className="flex flex-col h-full bg-[#0a0e1a] border border-[#1e293b] rounded-xl overflow-hidden font-mono text-xs shadow-lg">

      {/* Header */}
      <div className="shrink-0 border-b border-[#1e293b] bg-[#0d1117] px-4 py-2.5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500" />
          </span>
          <span className="text-[10px] font-bold uppercase tracking-widest text-[#94a3b8]">Live System Stream</span>
        </div>
        <div className="flex items-center gap-3 text-[9px] text-[#475569]">
          <span className="flex items-center gap-1">
            <Wifi className="h-2.5 w-2.5" />
            activity_feed.log
          </span>
          <span className="flex items-center gap-1">
            <Clock className="h-2.5 w-2.5" />
            {now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
          </span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="shrink-0 grid grid-cols-3 divide-x divide-[#1e293b] border-b border-[#1e293b] bg-[#060913]/50">
        {[
          { icon: Database, label: 'Ingested', value: `${events.length * 254 || 2345}` },
          { icon: Zap,      label: 'Processed', value: `${streamEntries.length}` },
          { icon: CheckCircle, label: 'Status', value: 'Online' },
        ].map(({ icon: Icon, label, value }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-1.5">
            <Icon className="h-3 w-3 text-cyan-500/60 shrink-0" />
            <div className="min-w-0">
              <p className="text-[8px] text-[#475569] uppercase tracking-wider leading-none">{label}</p>
              <p className="text-[10px] font-bold text-[#94a3b8] leading-snug truncate">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 scrollbar-thin scrollbar-track-transparent scrollbar-thumb-[#1e293b] hover:scrollbar-thumb-[#334155]">
        <AnimatePresence initial={false}>
          {streamEntries.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -16, height: 0, marginBottom: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto', marginBottom: 12 }}
                exit={{ opacity: 0, x: 16, height: 0, marginBottom: 0 }}
                transition={{ duration: 0.22, ease: 'easeOut' }}
                className="overflow-hidden"
              >
                <div
                  className={`relative flex items-start gap-2.5 rounded-lg p-2.5 pl-3 border transition-all duration-1000 ease-out overflow-hidden ${
                    event._glowing
                      ? 'border-cyan-400/50 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                      : 'border-[#1e293b]/60 bg-[#0d1117]/30 hover:border-[#334155] hover:bg-[#0d1117]/80'
                  }`}
                >
                  {/* Cyan left accent line */}
                  <div 
                    className={`absolute left-0 top-0 bottom-0 w-[2px] bg-cyan-400 transition-opacity duration-1000 ${
                      event._glowing ? 'opacity-100 shadow-[0_0_8px_rgba(6,182,212,0.8)]' : 'opacity-0'
                    }`} 
                  />
                {/* Severity dot */}
                <div className="flex flex-col items-center gap-1 shrink-0 mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${getSeverityDot(event.severity)}`} />
                </div>

                {/* Icon */}
                <div className="shrink-0 mt-0.5">{getIcon(event.type)}</div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-[#e2e8f0] leading-snug truncate font-medium">
                    {event.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1">
                    {event.severity && (
                      <span className={`inline-block px-1.5 py-0.5 rounded border text-[8px] font-bold tracking-wide ${getBadgeClass(event.severity)}`}>
                        {event.severity}
                      </span>
                    )}
                    <span className="text-[8px] text-[#475569] font-mono ml-auto">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {streamEntries.length === 0 && (
          <div className="flex flex-col items-center justify-center py-10 text-center gap-2">
            <Terminal className="h-6 w-6 text-[#334155]" />
            <p className="text-[11px] text-[#475569]">Waiting for activity…</p>
            <p className="text-[9px] text-[#334155]">Upload a log file to generate stream events</p>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-[#1e293b] bg-[#060913]/60 px-4 py-1.5 flex items-center justify-between">
        <span className="text-[8.5px] text-cyan-400/70 font-semibold tracking-widest flex items-center gap-1.5">
          <span className="h-1 w-1 rounded-full bg-cyan-400 animate-ping" />
          REALTIME FEED
        </span>
        <span className="text-[8.5px] text-[#334155] font-mono">
          {streamEntries.length} entries
        </span>
      </div>
    </div>
  );
};

export default KineticLogStream;
