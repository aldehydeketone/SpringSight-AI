import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Terminal, Shield, CheckCircle, AlertTriangle, FileText, Trash2 } from 'lucide-react';
import { ActivityEvent } from '../../types';

interface KineticLogStreamProps {
  events: ActivityEvent[];
}

export const KineticLogStream: React.FC<KineticLogStreamProps> = ({ events }) => {
  const [visibleEvents, setVisibleEvents] = useState<ActivityEvent[]>([]);

  useEffect(() => {
    // Take the last 6 events, reverse so newest are on top, and show them with transition
    setVisibleEvents(events.slice(0, 6));
  }, [events]);

  const getIcon = (type: ActivityEvent['type'], severity?: string) => {
    switch (type) {
      case 'UPLOAD':
        return <Terminal className="h-4 w-4 text-blue-400" />;
      case 'PARSE':
        return <Shield className="h-4 w-4 text-cyan-400" />;
      case 'ANALYZE':
        return <AlertTriangle className="h-4 w-4 text-yellow-400" />;
      case 'AI_COMPLETE':
        return <CheckCircle className="h-4 w-4 text-green-400" />;
      case 'PDF_EXPORT':
        return <FileText className="h-4 w-4 text-purple-400" />;
      case 'DELETE':
        return <Trash2 className="h-4 w-4 text-red-400" />;
      default:
        return <Terminal className="h-4 w-4 text-gray-400" />;
    }
  };

  const getBadgeClass = (severity?: string) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-950 text-red-400 border-red-800/50';
      case 'ERROR':
        return 'bg-rose-950 text-rose-400 border-rose-800/50';
      case 'WARN':
        return 'bg-amber-950 text-amber-400 border-amber-800/50';
      case 'INFO':
        return 'bg-blue-950 text-blue-400 border-blue-800/50';
      default:
        return 'bg-slate-900 text-slate-400 border-slate-800';
    }
  };

  return (
    <div className="w-full bg-[#12121a] border border-[#1e293b] rounded-xl overflow-hidden font-mono text-xs shadow-lg">
      <div className="border-b border-[#1e293b] bg-[#161622] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <div className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-[#94a3b8] font-medium uppercase tracking-wider text-[10px]">Live System Stream</span>
        </div>
        <span className="text-[10px] text-cyan-500/80">activity_feed.log</span>
      </div>

      <div className="p-4 space-y-3 min-h-[260px] max-h-[350px] overflow-y-auto scrollbar-thin">
        {visibleEvents.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-[#94a3b8] italic py-10 text-center px-4">
            <span className="mb-2 not-italic">📭</span>
            <span>No incident activity yet.</span>
            <span className="text-[10px] text-[#94a3b8]/60 mt-1">Upload a log file to start generating analysis events.</span>
          </div>
        ) : (
          <AnimatePresence initial={false}>
            {visibleEvents.map((event) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -20, height: 0 }}
                animate={{ opacity: 1, x: 0, height: 'auto' }}
                exit={{ opacity: 0, x: 20, height: 0 }}
                transition={{ duration: 0.25 }}
                className="border border-[#1e293b]/60 bg-[#161622]/40 rounded-lg p-3 flex items-start space-x-3 hover:border-cyan-500/30 transition-all duration-200"
              >
                <div className="mt-0.5">{getIcon(event.type, event.severity)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between space-x-2">
                    <span className="text-[#f1f5f9] truncate font-semibold">{event.message}</span>
                    <span className="text-[9px] text-[#94a3b8]/70">
                      {new Date(event.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>
                  </div>
                  {event.severity && (
                    <div className="mt-1 flex items-center">
                      <span className={`px-1.5 py-0.5 rounded border text-[9px] font-bold ${getBadgeClass(event.severity)}`}>
                        {event.severity}
                      </span>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        )}
      </div>
    </div>
  );
};
