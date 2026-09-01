import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadSimple,
  CloudArrowUp,
  TerminalWindow,
  Cpu,
  FileCode,
  ShieldWarning,
  Pulse,
  ArrowRight,
  Lightning,
  CheckCircle,
  FolderOpen,
} from '@phosphor-icons/react';
import { ShinyText } from './shiny-text';

interface UploadHeroCardProps {
  onAnalyzeSample: () => void;
  sampleLoading: boolean;
}

const WORKFLOW_STEPS = [
  { icon: UploadSimple,    label: 'Ingest',  sub: 'Drop or upload', color: 'blue' },
  { icon: FileCode,        label: 'Parse',   sub: 'Extract entries', color: 'purple' },
  { icon: ShieldWarning,   label: 'Detect',  sub: 'Find anomalies', color: 'amber' },
  { icon: Cpu,             label: 'Analyze', sub: 'AI root cause', color: 'cyan' },
  { icon: Pulse,           label: 'Report',  sub: 'Export insights', color: 'green' },
];

const CAPABILITIES = [
  { icon: FileCode, text: 'Spring Boot Stack Traces', color: 'blue' },
  { icon: Cpu, text: 'Root Cause Analysis', color: 'purple' },
  { icon: CheckCircle, text: 'AI Recommendations', color: 'cyan' },
  { icon: ShieldWarning, text: 'Security Log Detection', color: 'amber' },
  { icon: Pulse, text: 'Multi-format Logs', color: 'purple' },
  { icon: TerminalWindow, text: 'PDF Report Export', color: 'blue' },
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
    <div className="relative bg-[#0b0f19] rounded-2xl border border-slate-800 overflow-hidden shadow-xl flex flex-col h-full">

      {/* Ambient top gradient glow */}
      <div
        className="absolute top-0 left-0 right-0 h-36 pointer-events-none z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% -10%, rgba(99,102,241,0.16) 0%, rgba(59,130,246,0.06) 50%, transparent 80%)',
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
          <FolderOpen className="h-3.5 w-3.5 text-slate-500" weight="duotone" />
          <span className="text-[10.5px] font-medium text-slate-400 tracking-[0.02em] select-none">
            Upload Workspace
          </span>
        </div>

        {/* Status badge */}
        <div className="ml-auto flex items-center gap-2 bg-white/[0.04] border border-white/[0.07] px-2.5 py-[3px] rounded-full">
          <span
            className="w-[5px] h-[5px] rounded-full bg-emerald-400 shrink-0"
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
              ? 'border-indigo-400 bg-gradient-to-b from-indigo-500/[0.1] to-indigo-500/[0.05] shadow-[0_0_30px_rgba(99,102,241,0.25)]'
              : 'border-slate-700/80 bg-white/[0.01] hover:border-slate-600 hover:bg-white/[0.02] hover:shadow-[0_0_20px_rgba(255,255,255,0.02)]'
          }`}
        >
          {/* Subtle radial glow behind drop zone */}
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(255,255,255,0.02)_0%,transparent_70%)] pointer-events-none" />

          {/* Upload icon - Clean without circular box */}
          <CloudArrowUp
            className={`h-10 w-10 mb-2 transition-all duration-300 ${
              dragOver ? 'text-indigo-300 scale-110' : 'text-slate-400 group-hover:text-slate-200 group-hover:scale-105'
            }`}
            weight="duotone"
          />

          <p className={`text-sm font-semibold tracking-wide transition-colors duration-200 ${dragOver ? 'text-indigo-300' : 'text-white/80'}`}>
            {dragOver ? 'Release to open Upload Workspace' : 'Drop log files here'}
          </p>
          <p className="text-[11px] text-slate-400 font-sans mt-1">drag · click · or browse</p>
          <p className="text-[10px] text-slate-500 font-mono mt-2">.log · .txt (max 50 MB)</p>

          <input ref={fileInputRef} type="file" accept=".log,.txt" className="hidden" onChange={handleFileChange} />
        </div>

        {/* CTA Row */}
        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={openUploadWorkspace}
            className="flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white text-[11px] font-bold px-4 py-2.5 rounded-lg transition-all duration-200 shadow-md cursor-pointer"
          >
            <CloudArrowUp className="h-4 w-4" weight="bold" />
            Open Upload Workspace
            <ArrowRight className="h-3.5 w-3.5 ml-0.5 opacity-70" weight="bold" />
          </button>
          <button
            onClick={onAnalyzeSample}
            disabled={sampleLoading}
            className="flex items-center gap-1.5 bg-slate-800/60 border border-slate-700/60 hover:border-slate-500 hover:bg-slate-800 text-slate-300 hover:text-white text-[11px] font-semibold px-3.5 py-2.5 rounded-lg transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed whitespace-nowrap"
          >
            <TerminalWindow className="h-4 w-4 text-slate-400" weight="duotone" />
            {sampleLoading ? 'Analyzing…' : 'Try Sample'}
          </button>
        </div>

        {/* Bottom two-col: workflow + capabilities */}
        <div className="flex-1 grid grid-cols-5 gap-4 border-t border-slate-800/80 pt-3 min-h-0 px-2">

          {/* AI Workflow strip — 3 cols */}
          <div className="col-span-3 flex flex-col min-h-0 relative">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.12em] mb-2 shrink-0">AI Workflow</p>
            <div className="flex items-start justify-between flex-1 relative mt-1">
              
              {/* Connector lines: absolutely positioned at icon center */}
              <div className="absolute top-[12px] left-[16px] right-[16px] h-[2px] flex z-0">
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
                          background: `linear-gradient(90deg, ${stepConfig.hex}88, ${nextConfig.hex}88)`,
                          opacity: isActive || isCompleted ? 1 : 0.4,
                        }}
                      />
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
                      {/* Clean Icon without box wrapper */}
                      <Icon
                        className={`h-6 w-6 ${stepConfig.text} transition-all duration-300 ${
                          isActive || isCompleted ? 'opacity-100 drop-shadow-[0_0_8px_currentColor]' : 'opacity-85 group-hover/step:opacity-100 group-hover/step:scale-110'
                        }`}
                        weight="duotone"
                      />
                      
                      {/* Labels */}
                      <div className="flex flex-col items-center mt-2 gap-[2px]">
                        <span className={`text-[10px] font-medium tracking-wide transition-colors duration-200 ${isActive || isCompleted ? 'text-slate-200' : 'text-slate-400'}`}>
                          {step.label}
                        </span>
                        <span className="text-[9px] text-slate-500 leading-none whitespace-nowrap">
                          {step.sub}
                        </span>
                      </div>
                    </div>
                  </React.Fragment>
                );
              })}
            </div>

            {/* Gemini credibility marker */}
            <div className="flex items-baseline mt-4 opacity-80 hover:opacity-100 transition-opacity duration-300">
              <Lightning className="h-3.5 w-3.5 text-indigo-400 shrink-0 translate-y-[0.5px] mr-[6px]" weight="fill" />
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
          <div className="col-span-2 flex flex-col min-h-0 pl-2 border-l border-slate-800/80">
            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-[0.12em] mb-2 shrink-0">Capabilities</p>
            
            <div className="grid grid-cols-2 gap-1.5 flex-1 place-content-start">
              {CAPABILITIES.map(({ icon: Icon, text, color }) => {
                const capConfig = getColorConfig(color);
                return (
                  <div
                    key={text}
                    className="flex items-center gap-2 px-2 py-1.5 rounded-lg transition-all duration-200 hover:bg-white/[0.03] group/cap cursor-default"
                  >
                    <Icon
                      className={`h-4 w-4 ${capConfig.text} shrink-0 opacity-80 group-hover/cap:opacity-100 transition-all group-hover/cap:scale-105`}
                      weight="duotone"
                    />
                    <span className="text-[9px] font-medium text-slate-400 group-hover/cap:text-slate-300 transition-colors leading-tight">{text}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadHeroCard;
