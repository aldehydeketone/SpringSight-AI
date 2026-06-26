import React, { useRef, useState, useEffect } from 'react';
import { Brain, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../types';
import { motion } from 'framer-motion';

interface AiRecommendationPanelProps {
  reports: Report[];
  isLoading: boolean;
}

/** Maps backend confidence value to a display percentage string. */
const confidenceToPercent = (confidence?: string): string => {
  switch (confidence?.toUpperCase()) {
    case 'HIGH':
      return '90%';
    case 'MEDIUM':
      return '70%';
    case 'LOW':
      return '50%';
    default:
      return '—';
  }
};

/**
 * Parses Gemini recommendedFix into individual actions.
 * Supports numbered lists, bullet lists, and newline-separated text.
 */
const parseRecommendedActions = (fix?: string): string[] => {
  if (!fix) return [];

  const normalized = fix.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];

  const actions = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^\s*(?:\d+[\.\)]|[-•*])\s*/, '').trim())
    .filter((line) => line.length > 0);

  return actions.length > 0 ? actions : ['Review the detailed analysis.'];
};

export const AiRecommendationPanel: React.FC<AiRecommendationPanelProps> = ({ reports, isLoading }) => {
  const navigate = useNavigate();
  const latest = reports[0];

  const rootCauseRef = useRef<HTMLParagraphElement>(null);
  const [showReadMore, setShowReadMore] = useState(false);

  useEffect(() => {
    if (latest?.rootCause && rootCauseRef.current) {
      const el = rootCauseRef.current;
      const isTruncated = el.scrollHeight > el.clientHeight;
      setShowReadMore(isTruncated || latest.rootCause.length > 80);
    }
  }, [latest?.rootCause]);

  const severityColors: Record<string, string> = {
    CRITICAL: 'bg-red-500/20 text-red-400 border border-red-500/30',
    HIGH: 'bg-orange-500/20 text-orange-400 border border-orange-500/30',
    MEDIUM: 'bg-amber-500/20 text-amber-400 border border-amber-500/30',
    LOW: 'bg-green-500/20 text-green-400 border border-green-500/30',
  };

  const confidenceColors: Record<string, string> = {
    HIGH: 'text-green-400',
    MEDIUM: 'text-amber-400',
    LOW: 'text-orange-400',
  };

  // Skeleton while loading
  if (isLoading) {
    return (
      <div className="bg-[#1E293B] border border-[#00C8FF]/20 border-l-4 border-l-[#00C8FF] rounded-xl p-5 md:h-[200px] flex flex-col justify-between animate-pulse">
        <div className="flex items-center gap-3 mb-2">
          <div className="w-5 h-5 rounded bg-[#263145]" />
          <div className="w-40 h-4 rounded bg-[#263145]" />
          <div className="w-24 h-5 rounded-full bg-[#263145] ml-auto" />
        </div>
      <div className="grid grid-cols-1 md:grid-cols-[46%_24%_16%_7%_7%] gap-4 items-start">
          <div className="space-y-2">
            <div className="w-20 h-3 rounded bg-[#263145]" />
            <div className="w-full h-4 rounded bg-[#263145]" />
          </div>
          <div className="space-y-2">
            <div className="w-16 h-3 rounded bg-[#263145]" />
            <div className="w-full h-4 rounded bg-[#263145]" />
          </div>
          <div className="space-y-2">
            <div className="w-24 h-3 rounded bg-[#263145]" />
            <div className="w-full h-3 rounded bg-[#263145]" />
            <div className="w-3/4 h-3 rounded bg-[#263145]" />
          </div>
          <div className="space-y-2">
            <div className="w-16 h-3 rounded bg-[#263145]" />
            <div className="w-12 h-5 rounded bg-[#263145]" />
          </div>
          <div className="space-y-2">
            <div className="w-20 h-3 rounded bg-[#263145]" />
            <div className="w-10 h-6 rounded bg-[#263145]" />
          </div>
        </div>
        <div className="flex justify-end mt-2">
          <div className="w-28 h-4 rounded bg-[#263145]" />
        </div>
      </div>
    );
  }

  // Empty state
  if (!latest) {
    return (
      <motion.div
        className="bg-[#1E293B] border border-[#334155] border-l-4 border-l-[#00C8FF]/30 rounded-xl p-8 flex flex-col items-center justify-center text-center gap-3"
        initial={{ opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
      >
        <Brain className="w-10 h-10 text-[#334155]" />
        <p className="text-sm font-semibold text-[#94A3B8]">No analysis yet</p>
        <p className="text-xs text-[#64748B]">Upload a log file to receive AI recommendations.</p>
      </motion.div>
    );
  }

  const topActions = parseRecommendedActions(latest.recommendedFix).slice(0, 3);
  const confidenceDisplay = confidenceToPercent(latest.confidence);

  return (
    <motion.div
      className="bg-[#1E293B] border border-[#00C8FF]/20 border-l-4 border-l-[#00C8FF] rounded-xl p-5 h-auto md:min-h-[220px] flex flex-col justify-between"
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: 0.3 }}
    >
      {/* Header */}
      <div className="flex items-center gap-3 mb-3">
        <Brain className="w-5 h-5 text-[#00C8FF] shrink-0" />
        <h2 className="text-sm font-semibold text-[#F8FAFC]">AI Recommendation</h2>
        <span className="ml-auto text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#00C8FF]/10 text-[#00C8FF] border border-[#00C8FF]/20">
          Latest Analysis
        </span>
      </div>

      {/* 5-column layout */}
      <div className="grid grid-cols-1 md:grid-cols-[46%_24%_16%_7%_7%] gap-4 items-start mb-2">
        {/* Col 1 - Root Cause */}
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">
            ROOT CAUSE
          </p>
          <p
            ref={rootCauseRef}
            className="text-xs text-[#CBD5E1] leading-6 line-clamp-3 break-words"
          >
            {latest.rootCause || 'Unknown'}
          </p>
          {showReadMore && (
            <button
              onClick={() => navigate('/reports')}
              className="text-left text-[11px] font-semibold text-[#3B82F6] hover:text-[#00C8FF] transition-colors mt-1 cursor-pointer focus:outline-none"
            >
              Read More →
            </button>
          )}
        </div>

        {/* Col 2 - Impact */}
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">
            IMPACT
          </p>
          <p className="text-xs text-[#CBD5E1] leading-relaxed line-clamp-2">
            {latest.impact || 'No impact analysis recorded.'}
          </p>
        </div>

        {/* Col 3 - Recommended Actions */}
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">
            TOP 3 ACTIONS
          </p>
          {topActions.length > 0 ? (
            <div className="flex flex-col gap-1 overflow-hidden">
              {topActions.map((step, idx) => (
                <div
                  key={`${idx}-${step}`}
                  className="flex items-start gap-2 min-w-0 overflow-hidden text-xs text-[#CBD5E1] leading-tight"
                >
                  <span className="shrink-0 text-emerald-400 font-bold text-xs leading-none">✓</span>
                  <span className="min-w-0 flex-1 whitespace-nowrap overflow-hidden text-ellipsis">
                    {step}
                  </span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-xs text-[#64748B]">Review the detailed analysis.</p>
          )}
        </div>

        {/* Col 4 - Severity Badge */}
        <div className="flex flex-col items-start min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-1.5">
            SEVERITY
          </p>
          <span
            className={`text-[11px] font-semibold uppercase tracking-wide px-2 py-0.5 rounded-full ${severityColors[latest.severity] ?? severityColors['LOW']}`}
          >
            {latest.severity}
          </span>
        </div>

        {/* Col 5 - Confidence Percent */}
        <div className="flex flex-col min-w-0">
          <p className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B] mb-1">
            CONFIDENCE
          </p>
          <p className="text-2xl font-bold text-[#00C8FF] leading-none">
            {confidenceDisplay}
          </p>
          {latest.confidence && (
            <p
              className={`text-[10px] font-semibold mt-0.5 uppercase tracking-wider ${confidenceColors[latest.confidence.toUpperCase()] ?? 'text-[#64748B]'}`}
            >
              {latest.confidence}
            </p>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="flex justify-end border-t border-[#334155]/30 pt-2 shrink-0">
        <button
          onClick={() => navigate('/reports')}
          className="flex items-center gap-2 text-xs font-semibold text-[#3B82F6] hover:text-[#00C8FF] transition-colors duration-200 cursor-pointer focus:outline-none"
        >
          View Full Analysis
          <ArrowRight className="w-3.5 h-3.5" />
        </button>
      </div>
    </motion.div>
  );
};

export default AiRecommendationPanel;
