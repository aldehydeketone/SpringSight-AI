import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Upload, CloudUpload, Terminal, Cpu, FileCode, ShieldAlert, Activity, ArrowRight, Zap, CheckCircle2, FolderOpen,
} from 'lucide-react';
import { ShinyText } from './shiny-text';

interface UploadHeroCardProps {
  onAnalyzeSample: () => void;
  sampleLoading: boolean;
}

const WORKFLOW_STEPS = [
  { icon: Upload,      label: 'Ingest',  sub: 'Drop or upload', color: 'blue' },
  { icon: FileCode,    label: 'Parse',   sub: 'Extract entries', color: 'purple' },
  { icon: ShieldAlert, label: 'Detect',  sub: 'Find anomalies', color: 'amber' },
  { icon: Cpu,         label: 'Analyze', sub: 'AI root cause', color: 'cyan' },
  { icon: Activity,    label: 'Report',  sub: 'Export insights', color: 'green' },
];

const CAPABILITIES = [
  { icon: FileCode, text: 'Spring Boot Stack Traces', color: 'blue' },
  { icon: Cpu, text: 'Root Cause Analysis', color: 'purple' },
  { icon: CheckCircle2, text: 'AI Recommendations', color: 'cyan' },
  { icon: ShieldAlert, text: 'Security Log Detection', color: 'amber' },
  { icon: Activity, text: 'Multi-format Logs', color: 'purple' },
  { icon: Terminal, text: 'PDF Report Export', color: 'blue' },
];

const getColorConfig = (color: string) => {
  switch (color) {
    case 'blue': return { hex: '#3b82f6', bg: 'rgba(59,130,246,0.15)', glow: 'rgba(59,130,246,0.25)', border: 'rgba(59,130,246,0.3)', text: 'text-blue-400' };
    case 'purple': return { hex: '#8b5cf6', bg: 'rgba(139,92,246,0.15)', glow: 'rgba(139,92,246,0.25)', border: 'rgba(139,92,246,0.3)', text: 'text-purple-400' };
    case 'amber': return { hex: '#f59e0b', bg: 'rgba(245,158,11,0.15)', glow: 'rgba(245,158,11,0.25)', border: 'rgba(245,158,11,0.3)', text: 'text-amber-400' };
    case 'cyan': return { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.25)', border: 'rgba(6,182,212,0.3)', text: 'text-cyan-400' };
    case 'green': return { hex: '#22c55e', bg: 'rgba(34,197,94,0.15)', glow: 'rgba(34,197,94,0.25)', border: 'rgba(34,197,94,0.3)', text: 'text-green-400' };
    default: return { hex: '#06b6d4', bg: 'rgba(6,182,212,0.15)', glow: 'rgba(6,182,212,0.25)', border: 'rgba(6,182,212,0.3)', text: 'text-cyan-400' };
  }
};

export const UploadHeroCard: React.FC<UploadHeroCardProps> = ({
  onAnalyzeSample,
  sampleLoading,
}) => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);

  const handleDragOver = (e: React.DragEvent) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = (e: React.DragEvent) => { e.preventDefault(); setDragOver(false); };
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault(); setDragOver(false);
    const file = e.dataTransfer.files?.[0];
    if (file && (file.name.endsWith('.log') || file.name.endsWith('.txt'))) {
      navigate('/upload', { state: { droppedFile: file } });
    }
  };
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) navigate('/upload', { state: { droppedFile: file } });
    e.target.value = '';
  };
  const openUploadWorkspace = () => navigate('/upload');

  return (
    <div className="relative bg-[#060913] rounded-2xl border border-cyan-500/20 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.06)] flex flex-col h-full">

      {/* Ambient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-28 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.15) 0%, rgba(59,130,246,0.05) 50%, transparent 75%)',
        }}
      />

      {/* Title bar */}
      <div className="flex items-center gap-3 px-4 py-2 bg-white/[0.012] border-b border-white/[0.05] relative z-10 shrink-0">
        {/* macOS traffic lights */}
        <div className="flex items-center gap-1.5">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_5px_rgba(255,95,87,0.4)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-[0_0_5px_rgba(254,188,46,0.35)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-[0_0_5px_rgba(40,200,64,0.35)]" />
        </div>

        {/* Workspace title */}
        <div className="flex items-center gap-1.5 ml-1">
          <FolderOpen className="h-3 w-3 text-slate-500" strokeWidth={1.5} />
          <span className="text-[10.5px] font-medium text-slate-400 tracking-[0.02em] select-none">
            Upload Workspace
          </span>
        </div>

        {/* Status badge */}
        <div className="ml-auto flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-[3px] rounded-full">
          <span
            className="w-[5px] h-[5px] rounded-full bg-cyan-400 shrink-0"
            style={{ animation: 'diag-dot-breathe 2.8s ease-in-out infinite' }}
          />
          <span className="text-[9px] font-medium tracking-[0.07em] text-slate-300">System Ready</span>
        </div>
      </div>

      {/* Main body */}
      <div className="flex-1 flex flex-col gap-3 p-4 relative z-10 min-h-0">

        {/* Drop Zone */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          className={`relative flex flex-col items-center justify-center rounded-xl border border-dashed transition-all duration-300 cursor-pointer group overflow-hidden select-none py-4 ${
            dragOver
              ? 'border-cyan-400 bg-gradient-to-b from-cyan-500/[0.1] to-cyan-500/[0.05] shadow-[0_0_30px_rgba(6,182,212,0.25)]'
              : 'border-cyan-500/40 bg-white/[0.01] hover:border-cyan-400/60 hover:bg-gradient-to-b hover:from-cyan-950/[0.1] hover:to-transparent hover:shadow-[0_0_20px_rgba(6,182,212,0.1)]'
          }`}
        >
          {/* Subtle radial glow behind drop zone */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(6,182,212,0.05)_0%,transparent_70%)] pointer-events-none" />

          {/* Scanner sweep (only visible on drag over) */}
          {dragOver && (
            <div
              className="absolute left-0 right-0 h-px pointer-events-none z-0"
              style={{
                background: 'linear-gradient(90deg, transparent, rgba(6,182,212,0.8), transparent)',
                animation: 'scanline-anim 2.5s linear infinite',
              }}
            />
          )}
          {/* Grid pattern */}
          <div
            className="absolute inset-0 opacity-[0.025] pointer-events-none"
            style={{
              backgroundImage:
                'linear-gradient(rgba(6,182,212,0.6) 1px, transparent 1px), linear-gradient(90deg, rgba(6,182,212,0.6) 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />

          {/* Upload icon */}
          <div
            className={`relative w-11 h-11 rounded-full flex items-center justify-center mb-2 transition-all duration-300 ${
              dragOver
                ? 'bg-cyan-500/20 border border-cyan-400/50 scale-110 shadow-[0_0_25px_rgba(6,182,212,0.4)]'
                : 'bg-cyan-500/10 border border-cyan-500/30 group-hover:scale-105 group-hover:border-cyan-400/50 group-hover:shadow-[0_0_15px_rgba(6,182,212,0.2)]'
            }`}
          >
            <CloudUpload className={`h-5 w-5 transition-colors duration-200 ${dragOver ? 'text-cyan-300' : 'text-cyan-400'}`} />
            <div className="absolute inset-0 rounded-full bg-cyan-500/10 opacity-40 animate-pulse pointer-events-none" />
          </div>

          <p className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${dragOver ? 'text-cyan-300' : 'text-white/80'}`}>
            {dragOver ? 'Release to open Upload Workspace' : 'Drop log files here'}
          </p>
          <p className="text-[10px] text-zinc-500 font-mono mt-1">drag · click · or browse</p>

          {/* Format tags */}
          <div className="flex gap-1.5 mt-3 items-center">
            {['.log', '.txt'].map((fmt) => (
              <span key={fmt} className="font-mono text-[9px] px-2 py-0.5 rounded bg-cyan-950/30 text-cyan-400/80 border border-cyan-500/20">
                {fmt}
              </span>
            ))}
            <span className="font-mono text-[9px] px-1.5 py-0.5 text-zinc-600">· max 50 MB</span>
          </div>

          <input ref={fileInputRef} type="file" accept=".log,.txt" className="hidden" onChange={handleFileChange} />
        </div>

        {/* CTA Row */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openUploadWorkspace}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-indigo-500 via-violet-500 to-blue-600 text-white text-[11px] font-bold px-4 py-2.5 rounded-[var(--radius-btn)] transition-all duration-300 shadow-[var(--shadow-elevation)] hover:shadow-[0_0_20px_rgba(99,102,241,0.4)] hover:scale-[1.02] cursor-pointer will-change-transform"
          >
            <CloudUpload className="h-3.5 w-3.5" />
            Open Upload Workspace
            <ArrowRight className="h-3.5 w-3.5 ml-0.5 opacity-70" />
          </button>
          <button
            onClick={onAnalyzeSample}
            disabled={sampleLoading}
            className="flex items-center gap-1.5 bg-white/[0.03] border border-cyan-500/25 hover:border-cyan-400/50 hover:bg-cyan-950/20 text-cyan-400 text-[11px] font-semibold px-3.5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <Terminal className="h-3.5 w-3.5" />
            {sampleLoading ? 'Analyzing…' : 'Try Sample'}
          </button>
        </div>

        {/* Bottom two-col: workflow + capabilities */}
        <div className="flex-1 grid grid-cols-5 gap-4 border-t border-white/[0.04] pt-3 min-h-0 px-2">

          {/* AI Workflow strip — 3 cols */}
          <div className="col-span-3 flex flex-col min-h-0 relative">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.12em] mb-2 shrink-0">AI Workflow</p>
            <div className="flex items-start justify-between flex-1 relative mt-1">
              
              {/* Connector lines: absolutely positioned at icon center (top-[20px] = half of 40px icon) */}
              <div className="absolute top-[20px] left-[20px] right-[20px] h-[2px] flex z-0">
                {WORKFLOW_STEPS.map((step, idx) => {
                  if (idx === WORKFLOW_STEPS.length - 1) return null;
                  const nextConfig = getColorConfig(WORKFLOW_STEPS[idx + 1].color);
                  const stepConfig = getColorConfig(step.color);
                  const isActive = sampleLoading && idx === 1;
                  const isCompleted = sampleLoading && idx < 1;
                  
                  return (
                    <div key={`line-${idx}`} className="flex-1 h-full relative overflow-hidden mx-1">
                      <div
                        className="w-full h-full rounded-full transition-opacity duration-500"
                        style={{
                          background: `linear-gradient(90deg, ${stepConfig.hex}CC, ${nextConfig.hex}CC)`,
                          opacity: isActive || isCompleted ? 1 : 0.5,
                        }}
                      />
                      {isActive && (
                        <div
                          className="absolute top-0 left-0 h-full w-10 bg-white shadow-[0_0_8px_2px_rgba(255,255,255,0.8)] rounded-full"
                          style={{ animation: 'travel-pulse 1.5s ease-out infinite' }}
                        />
                      )}
                    </div>
                  );
                })}
              </div>

              {WORKFLOW_STEPS.map((step, idx) => {
                const Icon = step.icon;
                const isActive = sampleLoading && idx === 1;
                const isCompleted = sampleLoading && idx < 1;
                const stepConfig = getColorConfig(step.color);

                return (
                  <React.Fragment key={step.label}>
                    <div className="flex flex-col items-center z-10 group/step relative">
                      {/* Icon Container: 40×40 so top-[20px] connector hits exact centre */}
                      <div
                        className="w-10 h-10 rounded-[12px] flex items-center justify-center transition-all duration-300 relative group-hover/step:-translate-y-px"
                        style={{
                          background: `radial-gradient(circle at 40% 40%, ${stepConfig.bg} 0%, rgba(8,12,22,0.7) 80%)`,
                          border: `1px solid ${stepConfig.border}`,
                          boxShadow: isActive || isCompleted
                            ? `0 0 18px ${stepConfig.glow}, 0 0 6px ${stepConfig.glow}`
                            : `0 0 10px ${stepConfig.glow}60, inset 0 1px 0 rgba(255,255,255,0.06)`,
                          opacity: isActive || isCompleted ? 1 : 0.7,
                        }}
                      >
                        <Icon className={`h-4 w-4 ${stepConfig.text} transition-all duration-300 ${isActive || isCompleted ? 'opacity-100' : 'opacity-75 group-hover/step:opacity-100'}`} />
                      </div>
                      
                      {/* Labels */}
                      <div className="flex flex-col items-center mt-2 gap-[2px]">
                        <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-slate-600 leading-none whitespace-nowrap">
                          {step.sub}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Gemini credibility marker — aligned to Ingest icon left edge */}
            <div className="flex items-baseline mt-5 opacity-75 hover:opacity-100 transition-opacity duration-300">
              <Zap className="h-3 w-3 text-cyan-500/70 shrink-0 translate-y-[0.5px] mr-[6px]" />
              <span className="text-[9.5px] font-medium text-slate-500 tracking-wide mr-[9px]">Powered by</span>
              <ShinyText
                text="Gemini 2.5 Flash"
                speed={3.5}
                delay={5}
                color="#94A3B8"
                shineColor="#FFFFFF"
                spread={110}
                direction="left"
                yoyo={false}
                pauseOnHover={false}
              />
            </div>
          </div>

          {/* Capabilities — 2 cols */}
          <div className="col-span-2 flex flex-col min-h-0 pl-2 border-l border-white/[0.04]">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.12em] mb-2 shrink-0">Capabilities</p>
            
            <div className="grid grid-cols-2 gap-1.5 flex-1 place-content-start">
              {CAPABILITIES.map(({ icon: Icon, text, color }) => {
                const capConfig = getColorConfig(color);
                return (
                  <div
                    key={text}
                    className="flex items-center gap-1.5 px-2 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.03] hover:-translate-y-[1px] group/cap cursor-default"
                    style={{ background: 'rgba(255,255,255,0.015)' }}
                  >
                    <div
                      className="w-5 h-5 rounded-md flex items-center justify-center shrink-0 transition-all duration-200"
                      style={{
                        background: `radial-gradient(circle at top left, ${capConfig.bg}, transparent)`,
                        border: `1px solid ${capConfig.border}`,
                      }}
                    >
                      <Icon className={`h-3 w-3 ${capConfig.text} opacity-80 group-hover/cap:opacity-100 transition-opacity`} />
                    </div>
                    <span className="text-[9px] font-medium text-slate-400 group-hover/cap:text-slate-300 transition-colors leading-tight">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom diagnostic strip */}
      <div className="border-t border-white/[0.04] px-4 py-1.5 bg-black/40 relative z-10 shrink-0">
        <div className="flex items-center justify-between font-mono text-[8px] tracking-[0.08em]">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span
              className="h-1.5 w-1.5 rounded-full bg-emerald-400"
              style={{ animation: 'diag-dot-breathe 2.8s ease-in-out infinite' }}
            />
            DIAGNOSTIC ENGINE: ONLINE
          </span>
          <span className="text-slate-500">AI ENGINE: GEMINI 2.5 FLASH</span>
          <span className="text-slate-600">PARSER CAP: 50MB</span>
        </div>
      </div>
    </div>
  );
};

export default UploadHeroCard;
