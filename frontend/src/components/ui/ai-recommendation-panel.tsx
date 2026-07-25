import React, { useRef, useState, useEffect } from 'react';
import { Brain, ArrowRight, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Report } from '../../types';
import { motion, AnimatePresence } from 'framer-motion';

interface AiRecommendationPanelProps {
  reports: Report[];
  isLoading: boolean;
}

/** Maps backend confidence value to a display percentage (0–100). */
const confidenceToNum = (confidence?: string): number => {
  switch (confidence?.toUpperCase()) {
    case 'HIGH':   return 90;
    case 'MEDIUM': return 70;
    case 'LOW':    return 50;
    default:       return 0;
  }
};

/**
 * Highlights Java exception/error class names inside root-cause text.
 * On mount, a brief amber glow is applied then fades – draws attention once.
 */
const HighlightedRootCause: React.FC<{ text: string }> = ({ text }) => {
  const [glowing, setGlowing] = useState(true);

  useEffect(() => {
    const t = setTimeout(() => setGlowing(false), 450);
    return () => clearTimeout(t);
  }, []);

  const parts = text.split(/(\b[A-Z][a-zA-Z0-9]*(?:Exception|Error|Failure|Cause)\b)/g);
  return (
    <>
      {parts.map((part, i) =>
        /Exception|Error|Failure|Cause/.test(part) ? (
          <span
            key={i}
            className="font-bold transition-all duration-300"
            style={{
              color: glowing ? '#fbbf24' : '#ef4444',
              textShadow: glowing ? '0 0 8px rgba(251,191,36,0.7)' : '0 0 4px rgba(239,68,68,0.2)',
            }}
          >
            {part}
          </span>
        ) : (
          <span key={i}>{part}</span>
        )
      )}
    </>
  );
};

/**
 * Animated confidence bar – fills from 0 to target on mount, then
 * runs a single shimmer sweep.
 */
const ConfidenceBar: React.FC<{
  confidence?: string;
}> = ({ confidence }) => {
  const target = confidenceToNum(confidence);
  const [width, setWidth] = useState(0);
  const [count, setCount] = useState(0);
  const [shimmer, setShimmer] = useState(false);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) {
      setWidth(target);
      setCount(target);
      return;
    }
    // Slight delay so the card reveal finishes first
    const startDelay = setTimeout(() => {
      const duration = 1200;
      const startTime = performance.now();

      const tick = (now: number) => {
        const elapsed = Math.min(now - startTime, duration);
        const progress = 1 - Math.pow(1 - elapsed / duration, 3); // ease-out cubic
        const cur = Math.round(progress * target);
        setWidth(cur);
        setCount(cur);
        if (elapsed < duration) {
          requestAnimationFrame(tick);
        } else {
          setWidth(target);
          setCount(target);
          // After fill completes, trigger a single shimmer
          setTimeout(() => {
            setShimmer(true);
            setTimeout(() => setShimmer(false), 700);
          }, 80);
        }
      };
      requestAnimationFrame(tick);
    }, 350);

    return () => clearTimeout(startDelay);
  }, [target, reducedMotion]);

  const barGradient =
    confidence?.toUpperCase() === 'HIGH'
      ? 'linear-gradient(90deg, #22c55e, #4ade80)'
      : confidence?.toUpperCase() === 'MEDIUM'
      ? 'linear-gradient(90deg, #f59e0b, #fbbf24)'
      : 'linear-gradient(90deg, #f97316, #fb923c)';

  const barGlow =
    confidence?.toUpperCase() === 'HIGH'
      ? '0 0 8px rgba(34,197,94,0.5)'
      : confidence?.toUpperCase() === 'MEDIUM'
      ? '0 0 8px rgba(251,191,36,0.5)'
      : '0 0 8px rgba(251,146,60,0.5)';

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-400">Confidence</p>
        <span className="text-2xl font-bold text-slate-100 font-sans tracking-tight tabular-nums">
          {count}%
        </span>
      </div>
      <div className="h-2 w-full bg-slate-800/80 rounded-full overflow-hidden relative">
        <div
          className="h-full rounded-full"
          style={{
            width: `${width}%`,
            background: barGradient,
            boxShadow: barGlow,
            transition: reducedMotion ? 'none' : undefined,
          }}
        />
        {/* Single shimmer sweep */}
        {shimmer && (
          <div
            className="absolute inset-y-0 left-0 w-1/3 pointer-events-none"
            style={{
              background:
                'linear-gradient(90deg, transparent, rgba(255,255,255,0.35), transparent)',
              animation: 'shimmer-once 0.6s ease-out forwards',
            }}
          />
        )}
      </div>
    </div>
  );
};

/**
 * Brain icon container – soft glow reveal on mount, single breathing cycle
 * whenever `triggerKey` changes (new analysis).
 */
const BrainIcon: React.FC<{ triggerKey: string }> = ({ triggerKey }) => {
  const [glowPhase, setGlowPhase] = useState<'reveal' | 'breathe' | 'idle'>('reveal');
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  // Initial reveal
  useEffect(() => {
    if (reducedMotion) { setGlowPhase('idle'); return; }
    const t = setTimeout(() => setGlowPhase('idle'), 750);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  // Breathe once on new analysis
  useEffect(() => {
    if (!triggerKey || reducedMotion) return;
    setGlowPhase('breathe');
    const t = setTimeout(() => setGlowPhase('idle'), 2600);
    return () => clearTimeout(t);
  }, [triggerKey, reducedMotion]);

  const glowByPhase: Record<string, string> = {
    reveal:  '0 0 18px 3px rgba(0,200,255,0.55)',
    breathe: '0 0 20px 4px rgba(0,200,255,0.6)',
    idle:    '0 0 10px 1px rgba(0,200,255,0.35)',
  };

  return (
    <div
      className="w-9 h-9 rounded-xl flex items-center justify-center shrink-0"
      style={{
        background:
          'radial-gradient(circle at 35% 35%, rgba(0,200,255,0.65) 0%, rgba(0,100,200,0.22) 100%)',
        boxShadow: glowByPhase[glowPhase],
        border: '1px solid rgba(0,200,255,0.3)',
        transition: 'box-shadow 700ms ease-out',
      }}
    >
      <Brain className="w-4 h-4 text-white opacity-95" />
    </div>
  );
};

/**
 * CRITICAL badge – performs 2 glow pulses on mount then stays static.
 */
const CriticalBadge: React.FC<{ label: string; className: string; style: React.CSSProperties }> = ({
  label,
  className,
  style,
}) => {
  const [pulse, setPulse] = useState(true);
  const reducedMotion =
    typeof window !== 'undefined' &&
    window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  useEffect(() => {
    if (reducedMotion) { setPulse(false); return; }
    const t = setTimeout(() => setPulse(false), 2200);
    return () => clearTimeout(t);
  }, [reducedMotion]);

  return (
    <span
      className={className}
      style={{
        ...style,
        animation: pulse ? 'critical-badge-pulse 1.1s ease-in-out 2' : 'none',
      }}
    >
      {label}
    </span>
  );
};

/**
 * Parses Gemini recommendedFix into individual actions.
 */
const parseRecommendedActions = (fix?: string): string[] => {
  if (!fix) return [];
  const normalized = fix.replace(/\r\n/g, '\n').trim();
  if (!normalized) return [];
  const actions = normalized
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map((line) => line.replace(/^\s*(?:\d+[.\)]|[-•*])\s*/, '').trim())
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

  const severityConfig: Record<string, { className: string; style: React.CSSProperties }> = {
    CRITICAL: {
      className: 'text-white font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md',
      style: {
        background: 'linear-gradient(135deg, #ef4444, #dc2626)',
        boxShadow: '0 0 12px rgba(239,68,68,0.45)',
        border: '1px solid rgba(239,68,68,0.4)',
      },
    },
    HIGH: {
      className: 'text-orange-200 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md',
      style: {
        background: 'linear-gradient(135deg, #f97316aa, #ea580caa)',
        boxShadow: '0 0 8px rgba(249,115,22,0.35)',
        border: '1px solid rgba(249,115,22,0.35)',
      },
    },
    MEDIUM: {
      className: 'text-amber-200 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md',
      style: {
        background: 'linear-gradient(135deg, #f59e0baa, #d97706aa)',
        boxShadow: '0 0 8px rgba(245,158,11,0.3)',
        border: '1px solid rgba(245,158,11,0.3)',
      },
    },
    LOW: {
      className: 'text-green-200 font-bold text-[10px] uppercase tracking-wide px-2.5 py-1 rounded-md',
      style: {
        background: 'linear-gradient(135deg, #22c55eaa, #16a34aaa)',
        boxShadow: '0 0 8px rgba(34,197,94,0.3)',
        border: '1px solid rgba(34,197,94,0.3)',
      },
    },
  };

  const cardStyle: React.CSSProperties = {
    background: 'linear-gradient(145deg, #0f1420, #0a0e17)',
    border: '1px solid rgba(0,170,255,0.12)',
    boxShadow: '0 4px 24px -4px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.04)',
  };

  const leftAccentStyle: React.CSSProperties = {
    background: 'linear-gradient(180deg, #00aaff, #0066cc)',
    boxShadow: '2px 0 12px rgba(0,170,255,0.4)',
    width: '4px',
    borderRadius: '4px 0 0 4px',
    flexShrink: 0,
  };

  // Skeleton
  if (isLoading) {
    return (
      <div className="flex rounded-xl overflow-hidden min-h-[180px] animate-pulse" style={cardStyle}>
        <div style={leftAccentStyle} />
        <div className="flex-1 p-5 flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-slate-700/60" />
            <div className="w-40 h-4 rounded bg-slate-700/60" />
            <div className="w-24 h-5 rounded-full bg-slate-700/60 ml-auto" />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
            <div className="space-y-2">
              <div className="w-20 h-3 rounded bg-slate-700/60" />
              <div className="w-full h-4 rounded bg-slate-700/60" />
              <div className="w-3/4 h-4 rounded bg-slate-700/60" />
            </div>
            <div className="space-y-2">
              <div className="w-16 h-3 rounded bg-slate-700/60" />
              <div className="w-full h-4 rounded bg-slate-700/60" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Empty state
  if (!latest) {
    return (
      <motion.div
        className="flex rounded-xl overflow-hidden p-8 flex-col items-center justify-center text-center gap-3"
        style={cardStyle}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        <Brain className="w-10 h-10 text-slate-700" />
        <p className="text-sm font-semibold text-slate-400">No analysis yet</p>
        <p className="text-xs text-slate-500">Upload a log file to receive AI recommendations.</p>
      </motion.div>
    );
  }

  const topActions = parseRecommendedActions(latest.recommendedFix).slice(0, 3);
  const sevCfg = severityConfig[latest.severity?.toUpperCase()] ?? severityConfig['LOW'];
  // Key for brain-icon breathe trigger — changes when the report changes
  const analysisKey = String(latest.id ?? latest.filename ?? '');

  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={analysisKey}
        className="flex rounded-xl overflow-hidden h-full"
        style={cardStyle}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -4 }}
        transition={{ duration: 0.28, ease: 'easeOut' }}
      >
        {/* Left gradient accent bar */}
        <div style={leftAccentStyle} />

        <div className="flex-1 p-5 flex flex-col justify-between min-w-0">
          <div className="flex items-center gap-3 mb-5">
            <BrainIcon triggerKey={analysisKey} />
            <div className="flex flex-col">
              <h2 className="text-xs font-semibold text-slate-200 uppercase tracking-wider">AI Recommendation</h2>
              <span className="text-[9px] font-medium text-slate-500 tracking-wide mt-0.5">Latest Analysis</span>
            </div>
          </div>

          {/* Structured horizontal layout */}
          <div className="flex-1 flex flex-col md:flex-row items-start gap-0 mb-4">

            {/* Col 1: Root Cause */}
            <div className="flex flex-col min-w-0 flex-[1.6] pr-5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Root Cause</p>
              <p
                ref={rootCauseRef}
                className="text-[11px] text-slate-300 leading-relaxed break-words font-mono line-clamp-4"
                style={{
                  background: 'rgba(0,0,0,0.3)',
                  padding: '10px 12px',
                  borderRadius: '8px',
                  border: '1px solid rgba(239,68,68,0.12)',
                  borderLeft: '3px solid rgba(239,68,68,0.35)',
                }}
                title={latest.rootCause}
              >
                <HighlightedRootCause text={latest.rootCause || 'Unknown'} />
              </p>
              {showReadMore && (
                <button
                  onClick={() => navigate('/reports')}
                  className="group text-left text-[10px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors mt-2 cursor-pointer focus:outline-none flex items-center gap-1"
                >
                  Read More
                  <ArrowRight className="w-3 h-3 transition-transform duration-150 ease-out group-hover:translate-x-1" />
                </button>
              )}
            </div>

            {/* Divider */}
            <div className="hidden md:block self-stretch w-px bg-white/[0.06] mx-1 shrink-0" />

            {/* Col 2: Impact */}
            <div className="flex flex-col min-w-0 flex-[1.1] px-5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Impact</p>
              <p className="text-[11px] text-slate-300 leading-[1.65] line-clamp-4" title={latest.impact}>
                {latest.impact ? (
                  <>
                    <span className="font-medium text-slate-200">
                      {latest.impact.split('.')[0] + (latest.impact.includes('.') ? '. ' : '')}
                    </span>
                    {latest.impact.substring(latest.impact.indexOf('.') + 1).trim()}
                  </>
                ) : (
                  'No impact analysis recorded.'
                )}
              </p>
            </div>

            {/* Divider */}
            <div className="hidden md:block self-stretch w-px bg-white/[0.06] mx-1 shrink-0" />

            {/* Col 3: Severity & Confidence */}
            <div className="flex flex-col min-w-0 flex-1 px-5 gap-5">
              <div>
                <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Severity</p>
                {latest.severity?.toUpperCase() === 'CRITICAL' ? (
                  <CriticalBadge label={latest.severity} className={sevCfg.className} style={sevCfg.style} />
                ) : (
                  <span className={sevCfg.className} style={sevCfg.style}>
                    {latest.severity}
                  </span>
                )}
              </div>
              <ConfidenceBar confidence={latest.confidence} />
            </div>

            {/* Divider */}
            <div className="hidden md:block self-stretch w-px bg-white/[0.06] mx-1 shrink-0" />

            {/* Col 4: Recommended Actions – staggered fade-in */}
            <div className="flex flex-col min-w-0 flex-[1.3] pl-5">
              <p className="text-[9px] font-semibold uppercase tracking-wider text-slate-500 mb-2.5">Recommended Actions</p>
              {topActions.length > 0 ? (
                <div className="flex flex-col gap-3.5">
                  {topActions.map((step, idx) => (
                    <motion.div
                      key={`${idx}-${step}`}
                      className="flex items-start gap-2.5 min-w-0"
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.22, ease: 'easeOut', delay: 0.35 + idx * 0.1 }}
                    >
                      {/* Glowing check badge */}
                      <div
                        className="w-4 h-4 rounded-md flex items-center justify-center shrink-0 mt-[1px]"
                        style={{
                          background:
                            'radial-gradient(circle at 35% 35%, rgba(34,197,94,0.7) 0%, rgba(16,130,60,0.3) 100%)',
                          boxShadow: '0 0 6px rgba(34,197,94,0.4)',
                          border: '1px solid rgba(34,197,94,0.4)',
                        }}
                      >
                        <CheckCircle2 className="w-2.5 h-2.5 text-white opacity-90" />
                      </div>
                      <span
                        className="text-[11px] text-slate-300 leading-[1.5] min-w-0 flex-1 truncate"
                        title={step}
                      >
                        {step}
                      </span>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <p className="text-[11px] text-slate-500">Review the detailed analysis.</p>
              )}
            </div>

          </div>

          {/* Footer */}
          <div
            className="flex justify-end pt-5 shrink-0"
            style={{ borderTop: '1px solid rgba(255,255,255,0.06)' }}
          >
            <button
              onClick={() => navigate('/reports')}
              className="group flex items-center gap-1.5 text-[11px] font-semibold text-cyan-400 hover:text-cyan-300 transition-colors duration-150 cursor-pointer focus:outline-none px-3 py-1.5 rounded-lg"
              style={{ transition: 'background 0.15s ease, color 0.15s ease' }}
              onMouseEnter={(e) => (e.currentTarget.style.background = 'rgba(0,200,255,0.07)')}
              onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
            >
              View Full Analysis
              <ArrowRight className="w-3.5 h-3.5 transition-transform duration-150 ease-out group-hover:translate-x-1" />
            </button>
          </div>
        </div>
      </motion.div>
    </AnimatePresence>
  );
};

export default AiRecommendationPanel;
