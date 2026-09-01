import React, { useEffect, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  TerminalWindow,
  ShieldCheck,
  CheckCircle,
  Warning,
  FileText,
  Trash,
  Radio,
  Database,
  Lightning,
} from '@phosphor-icons/react';
import { ActivityEvent } from '../../types';
import { GlowCard } from './glow-card';

interface KineticLogStreamProps {
  events: ActivityEvent[];
}

const LIVE_FEED: { type: ActivityEvent['type']; message: string; severity: string }[] = [
  { type: 'AI_COMPLETE', message: 'AI RCA completed for production-spring-boot.log', severity: 'CRITICAL' },
  { type: 'PARSE',       message: 'Log file production-spring-boot.log processed successfully', severity: 'INFO' },
  { type: 'AI_COMPLETE', message: 'AI RCA completed for gateway-access.log',           severity: 'HIGH' },
  { type: 'UPLOAD',      message: 'Log file gateway-access.log uploaded (1,543 entries)', severity: 'INFO' },
  { type: 'AI_COMPLETE', message: 'AI RCA completed for payment-service.log',          severity: 'MEDIUM' },
  { type: 'PARSE',       message: 'Log file payment-service.log processed successfully', severity: 'INFO' },
  { type: 'AI_COMPLETE', message: 'AI RCA completed for notification-worker.log',      severity: 'LOW' },
  { type: 'ANALYZE',     message: 'Gemini 2.5 Flash RCA model calibrated & active',    severity: 'INFO' },
];

let liveIdx = 0;

const getIcon = (type: ActivityEvent['type']) => {
  switch (type) {
    case 'UPLOAD':      return <TerminalWindow className="h-3.5 w-3.5 text-sky-400" weight="duotone" />;
    case 'PARSE':       return <ShieldCheck className="h-3.5 w-3.5 text-cyan-400" weight="duotone" />;
    case 'ANALYZE':     return <Warning className="h-3.5 w-3.5 text-amber-400" weight="bold" />;
    case 'AI_COMPLETE': return <CheckCircle className="h-3.5 w-3.5 text-emerald-400" weight="fill" />;
    case 'PDF_EXPORT':  return <FileText className="h-3.5 w-3.5 text-indigo-400" weight="duotone" />;
    case 'DELETE':      return <Trash className="h-3.5 w-3.5 text-rose-400" weight="bold" />;
    default:            return <TerminalWindow className="h-3.5 w-3.5 text-slate-400" weight="duotone" />;
  }
};

const getBadgeClass = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-500/15 text-red-400 border-red-500/30 font-bold';
    case 'HIGH':     return 'bg-orange-500/15 text-orange-400 border-orange-500/30 font-bold';
    case 'MEDIUM':   return 'bg-indigo-500/15 text-indigo-300 border-indigo-500/30 font-semibold';
    case 'LOW':      return 'bg-slate-800 text-slate-300 border-slate-700/60 font-medium';
    case 'WARN':     return 'bg-amber-500/15 text-amber-400 border-amber-500/30 font-bold';
    case 'INFO':     return 'bg-sky-500/10 text-sky-400 border-sky-500/30 font-medium';
    default:         return 'bg-slate-800/60 text-slate-400 border-slate-700/40';
  }
};

const getSeverityDot = (severity?: string) => {
  switch (severity?.toUpperCase()) {
    case 'CRITICAL': return 'bg-red-400 shadow-[0_0_8px_rgba(239,68,68,0.9)]';
    case 'HIGH':     return 'bg-orange-400 shadow-[0_0_8px_rgba(249,115,22,0.9)]';
    case 'MEDIUM':   return 'bg-indigo-400 shadow-[0_0_8px_rgba(129,140,248,0.9)]';
    case 'LOW':      return 'bg-slate-400 shadow-[0_0_4px_rgba(148,163,184,0.6)]';
    case 'WARN':     return 'bg-amber-400 shadow-[0_0_8px_rgba(245,158,11,0.9)]';
    case 'INFO':     return 'bg-sky-400 shadow-[0_0_8px_rgba(56,189,248,0.8)]';
    default:         return 'bg-slate-400';
  }
};

export const KineticLogStream: React.FC<KineticLogStreamProps> = ({ events }) => {
  const [streamEntries, setStreamEntries] = useState<(ActivityEvent & { _glowing?: boolean })[]>(() => {
    return (events && events.length > 0)
      ? events.slice(0, 10).map((e) => ({ ...e, _glowing: false }))
      : LIVE_FEED.slice(0, 4).map((f, i) => ({
          id: `init-${i}`,
          timestamp: new Date(Date.now() - (4 - i) * 12000).toISOString(),
          type: f.type,
          message: f.message,
          severity: f.severity as any,
          _glowing: false,
        }));
  });

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (events && events.length > 0) {
      setStreamEntries(events.slice(0, 10).map((e) => ({ ...e, _glowing: false })));
    }
  }, [events]);

  useEffect(() => {
    timerRef.current = setInterval(() => {
      const feedItem = LIVE_FEED[liveIdx % LIVE_FEED.length];
      liveIdx++;

      const newEntry: ActivityEvent & { _glowing: boolean } = {
        id: `live-${Date.now()}`,
        timestamp: new Date().toISOString(),
        type: feedItem.type,
        message: feedItem.message,
        severity: feedItem.severity as any,
        _glowing: true,
      };

      setStreamEntries((prev) => {
        const next = [newEntry, ...prev.slice(0, 9)];
        return next;
      });

      setTimeout(() => {
        setStreamEntries((prev) =>
          prev.map((item) => (item.id === newEntry.id ? { ...item, _glowing: false } : item))
        );
      }, 1500);
    }, 4500);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  return (
    <GlowCard
      glowColor="rgba(99,102,241,0.15)"
      glowOpacity={0.2}
      className="flex flex-col h-full bg-[#0b0f19] border border-slate-800 rounded-2xl overflow-hidden shadow-xl"
    >
      {/* Header */}
      <div className="shrink-0 border-b border-slate-800/80 bg-[#0d1220] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-60" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
          </span>
          <span className="text-xs font-bold uppercase tracking-wider text-slate-200">Live Ingestion Telemetry</span>
        </div>
        <div className="flex items-center gap-2 text-[10px] text-slate-400 font-mono">
          <Radio className="h-3 w-3 text-emerald-400 animate-pulse" />
          <span>telemetry.stream</span>
        </div>
      </div>

      {/* Stats strip */}
      <div className="shrink-0 grid grid-cols-3 divide-x divide-slate-800/80 border-b border-slate-800/80 bg-[#080c14]">
        {[
          { icon: Database, label: 'Ingested', value: `${events.length * 254 || 8128}`, color: 'text-sky-400' },
          { icon: Lightning, label: 'Processed', value: `${streamEntries.length}`, color: 'text-indigo-400' },
          { icon: CheckCircle, label: 'Status', value: 'Live', color: 'text-emerald-400' },
        ].map(({ icon: Icon, label, value, color }) => (
          <div key={label} className="flex items-center gap-2 px-3 py-2">
            <Icon className={`h-3.5 w-3.5 ${color} shrink-0`} weight="duotone" />
            <div className="min-w-0">
              <p className="text-[9px] text-slate-500 uppercase tracking-wider leading-none font-medium">{label}</p>
              <p className="text-[11px] font-bold text-slate-200 leading-snug truncate mt-0.5">{value}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto overflow-x-hidden p-3 space-y-2 scrollbar-thin">
        <AnimatePresence initial={false}>
          {streamEntries.map((event) => (
            <motion.div
              key={event.id}
              initial={{ opacity: 0, scale: 0.88, y: -16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.88, height: 0 }}
              transition={{ type: 'spring', stiffness: 450, damping: 26 }}
              className="overflow-hidden"
            >
              <div
                className={`relative flex items-start gap-3 rounded-xl p-2.5 border transition-all duration-300 ${
                  event._glowing
                    ? 'border-cyan-500/50 bg-cyan-950/30 shadow-[0_0_15px_rgba(6,182,212,0.15)]'
                    : 'border-slate-800/60 bg-[#080c14]/70 hover:border-slate-700 hover:bg-[#0e1424]'
                }`}
              >
                <div className="flex items-center gap-1.5 shrink-0 mt-0.5">
                  <div className={`h-1.5 w-1.5 rounded-full ${getSeverityDot(event.severity)}`} />
                  {getIcon(event.type)}
                </div>

                <div className="flex-1 min-w-0">
                  <p className="text-[11px] text-slate-200 leading-tight truncate font-sans font-medium">
                    {event.message}
                  </p>
                  <div className="flex items-center gap-2 mt-1.5">
                    {event.severity && (
                      <span className={`inline-block px-1.5 py-0.2 rounded text-[8px] font-bold border ${getBadgeClass(event.severity)}`}>
                        {event.severity}
                      </span>
                    )}
                    <span className="text-[9px] text-slate-500 font-mono ml-auto tabular-nums">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>

      {/* Footer */}
      <div className="shrink-0 border-t border-slate-800/80 bg-[#080c14] px-4 py-2 flex items-center justify-between text-[10px] text-slate-400">
        <span className="text-cyan-400 font-semibold tracking-wide flex items-center gap-1.5">
          <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping" />
          REALTIME INGESTION
        </span>
        <span className="font-mono tabular-nums text-slate-500">
          {streamEntries.length} events logged
        </span>
      </div>
    </GlowCard>
  );
};

export default KineticLogStream;
