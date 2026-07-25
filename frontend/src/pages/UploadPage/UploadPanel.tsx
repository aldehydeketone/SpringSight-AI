import React, { useRef, useState, useEffect } from 'react';
import { Upload, AlertCircle, FileText, RefreshCw, Terminal, CheckCircle } from 'lucide-react';

interface UploadPanelProps {
  onFileSelect: (file: File) => void;
  selectedFile: File | null;
  status: 'idle' | 'processing' | 'error' | 'success';
  uploadPercent: number;
  progress: number;
  errorMessage: string | null;
  onRetry: () => void;
  onStartSampleAnalysis: () => void;
  onStartRealAnalysis: () => void;
  parseStats: any;
}

export const UploadPanel: React.FC<UploadPanelProps> = ({
  onFileSelect,
  selectedFile,
  status,
  uploadPercent,
  progress,
  errorMessage,
  onRetry,
  onStartSampleAnalysis,
  onStartRealAnalysis,
  parseStats,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dragOver, setDragOver] = useState(false);
  const [uploadTime, setUploadTime] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'processing' && !uploadTime) {
      setUploadTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }));
    } else if (status === 'idle') {
      setUploadTime(null);
    }
  }, [status]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = () => {
    setDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (status !== 'idle') return;

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.log') || file.name.endsWith('.txt')) {
        onFileSelect(file);
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      onFileSelect(e.target.files[0]);
    }
  };

  const fmtSize = (b: number) => {
    if (b < 1024) return b + ' B';
    if (b < 1024 * 1024) return (b / 1024).toFixed(1) + ' KB';
    return (b / 1024 / 1024).toFixed(1) + ' MB';
  };

  const extOf = (n: string) => {
    return (n.split('.').pop() || '').toUpperCase().slice(0, 4);
  };

  return (
    <div className="flex flex-col gap-5 p-6 bg-gradient-to-b from-white/[0.015] to-transparent border-r border-cyan-500/[0.08] select-none h-full justify-between">
      <div>
        {/* Panel header info — scaled up */}
        <div className="flex items-center justify-between pb-3 mb-4 border-b border-cyan-500/[0.06]">
          <span className="text-[11px] font-mono text-zinc-400 uppercase tracking-widest font-semibold">Workspace / Log Ingest</span>
          <span className="text-[10px] px-2.5 py-1 rounded bg-cyan-950/40 text-cyan-400 border border-cyan-500/25 font-mono shadow-[0_0_6px_rgba(6,182,212,0.06)]">v1.2.0</span>
        </div>

        {/* Drag & Drop Zone — scaled up */}
        <div
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => status === 'idle' && fileInputRef.current?.click()}
          className={`relative border border-dashed rounded-xl p-7 min-h-[240px] sm:min-h-[260px] flex flex-col items-center justify-center text-center cursor-pointer transition-all duration-300 ${
            dragOver 
              ? 'border-cyan-400 bg-cyan-500/5 shadow-[0_0_30px_rgba(6,182,212,0.15)] scale-[1.005]' 
              : 'border-cyan-500/25 bg-cyan-950/[0.015] hover:border-cyan-500/45 hover:bg-cyan-950/[0.03] hover:shadow-[0_0_20px_rgba(6,182,212,0.06)]'
          }`}
        >
          {/* Centered icon — scaled up */}
          <div className="relative w-12 h-12 bg-cyan-500/5 border border-cyan-500/30 rounded-lg flex items-center justify-center mb-3.5 transition-transform group-hover:scale-105 duration-300">
            <Upload className="h-6 w-6 text-cyan-400" />
            <div className="absolute inset-[-3px] rounded-[11px] bg-cyan-500/10 opacity-30 animate-pulse pointer-events-none" />
          </div>
          
          <h4 className="text-sm font-bold text-white tracking-wide">Drop log files here</h4>
          <p className="text-[11px] text-zinc-500 font-mono mt-1.5">drag · click · or paste</p>
          
          {status === 'idle' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                fileInputRef.current?.click();
              }}
              className="mt-4 flex items-center gap-2 bg-cyan-500/10 border border-cyan-500/30 hover:border-cyan-400 hover:bg-cyan-500/20 text-cyan-300 text-[11px] font-semibold px-5 py-2.5 rounded-md transition-all shadow-[0_0_15px_rgba(6,182,212,0.06)] cursor-pointer hover:shadow-[0_0_20px_rgba(6,182,212,0.12)]"
            >
              <Upload className="h-4 w-4" /> Choose file
            </button>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept=".log,.txt"
            onChange={handleFileChange}
            className="hidden"
          />
        </div>

        {/* Accepted Formats Tag Row — scaled up */}
        <div className="flex gap-2.5 mt-4">
          <span className="font-mono text-[10px] px-3 py-1 rounded bg-cyan-950/25 text-cyan-400 border border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.06)]">
            .log
          </span>
          <span className="font-mono text-[10px] px-3 py-1 rounded bg-cyan-950/25 text-cyan-400 border border-cyan-500/25 shadow-[0_0_8px_rgba(6,182,212,0.06)]">
            .txt
          </span>
        </div>

        {/* Upload Cards Container — Bigger file card */}
        <div className="flex flex-col gap-3 mt-5">
          {selectedFile && (
            <div className={`p-4 rounded-lg border flex items-start gap-4 transition-all duration-300 ${
              status === 'processing' 
                ? 'bg-cyan-500/[0.02] border-cyan-500/30 shadow-[0_0_20px_rgba(6,182,212,0.06)]' 
                : status === 'success' 
                ? 'bg-emerald-500/[0.02] border-emerald-500/30 shadow-[0_0_16px_rgba(52,211,153,0.06)]'
                : status === 'error'
                ? 'bg-red-500/[0.02] border-red-500/30 shadow-[0_0_16px_rgba(239,68,68,0.06)]'
                : 'bg-white/[0.015] border-cyan-500/[0.08]'
            }`}>
              <div className="w-10 h-12 rounded bg-gradient-to-br from-cyan-950 to-zinc-950 border border-cyan-500/25 flex items-center justify-center shrink-0 shadow-[0_0_10px_rgba(6,182,212,0.06)]">
                <FileText className="h-5.5 w-5.5 text-cyan-400" />
              </div>

              <div className="flex-1 min-w-0">
                <div className="text-[13px] font-mono font-bold text-white/95 truncate">{selectedFile.name}</div>
                <div className="flex flex-wrap items-center gap-x-2.5 gap-y-0.5 text-[10px] text-zinc-400 mt-1.5">
                  <span>Size: {fmtSize(selectedFile.size)}</span>
                  <span className="opacity-30">•</span>
                  <span className="font-mono uppercase text-[9px] text-cyan-400/90 font-bold">{extOf(selectedFile.name)}</span>
                  {uploadTime && (
                    <>
                      <span className="opacity-30">•</span>
                      <span>Time: {uploadTime}</span>
                    </>
                  )}
                  {status === 'success' && parseStats && (
                    <>
                      <span className="opacity-30">•</span>
                      <span className="text-emerald-400">Lines: {parseStats.totalLines}</span>
                    </>
                  )}
                </div>

                {status === 'idle' && (
                  <div className="mt-3.5 flex items-center gap-3">
                    <span className="text-[10px] text-cyan-400 font-semibold tracking-wider uppercase">READY FOR INGEST</span>
                    <button
                      onClick={onStartRealAnalysis}
                      className="text-[10px] font-mono font-bold px-4 py-2 bg-cyan-500 hover:bg-cyan-400 text-black rounded transition-all shadow-[0_0_12px_rgba(6,182,212,0.2)] cursor-pointer hover:shadow-[0_0_18px_rgba(6,182,212,0.3)]"
                    >
                      Analyze Logs
                    </button>
                  </div>
                )}

                {status === 'processing' && (
                  <div className="mt-3">
                    <div className="flex justify-between text-[9px] font-mono text-zinc-400 uppercase tracking-wider mb-1.5">
                      <span>{progress < 25 ? 'Uploading' : progress < 60 ? 'Parsing' : 'AI analysis'}</span>
                      <span className="text-cyan-400">{progress}%</span>
                    </div>
                    <div className="h-1.5 bg-zinc-900 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full transition-all duration-300 shadow-[0_0_8px_rgba(6,182,212,0.3)]"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  </div>
                )}

                {status === 'success' && (
                  <div className="text-[10px] text-emerald-400 font-semibold font-mono mt-2.5 flex items-center gap-1.5 uppercase">
                    <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0" />
                    Ingestion successful
                  </div>
                )}

                {status === 'error' && (
                  <div className="mt-3 space-y-2">
                    <div className="text-[10px] text-red-400 font-mono font-semibold leading-relaxed">
                      {errorMessage || 'Diagnostics pipeline failed'}
                    </div>
                    <button
                      onClick={onRetry}
                      className="flex items-center gap-1.5 text-[10px] font-mono font-bold px-3.5 py-2 border border-red-500/30 bg-red-500/10 text-red-400 rounded hover:bg-red-500/20 transition-all"
                    >
                      <RefreshCw className="h-3.5 w-3.5" /> Retry
                    </button>
                  </div>
                )}
              </div>

              <div className={`w-2 h-2 rounded-full shrink-0 mt-1 transition-all duration-300 ${
                status === 'processing'
                  ? 'bg-cyan-500 shadow-[0_0_8px_2px_rgba(6,182,212,0.5)] animate-pulse'
                  : status === 'success'
                  ? 'bg-emerald-500 shadow-[0_0_8px_2px_rgba(52,211,153,0.5)]'
                  : status === 'error'
                  ? 'bg-red-500 shadow-[0_0_8px_2px_rgba(239,68,68,0.5)]'
                  : 'bg-cyan-400/60 shadow-[0_0_6px_rgba(6,182,212,0.3)]'
              }`} />
            </div>
          )}
        </div>
      </div>

      {/* Diagnostic Engine heartbeat strip — scaled up */}
      <div className="mt-4 border-t border-cyan-500/[0.06] pt-3.5 font-mono text-[9px] text-zinc-400 flex flex-col gap-1.5 shrink-0 select-none">
        <div className="flex items-center justify-between">
          <span className="flex items-center gap-2 text-cyan-400/80 font-bold tracking-widest">
            <span className="h-1.5 w-1.5 rounded-full bg-cyan-400 animate-ping shrink-0" />
            DIAGNOSTIC ENGINE: ONLINE
          </span>
          <span className="text-zinc-500">PARSER CAP: 10MB</span>
        </div>
        <div className="flex items-center justify-between text-[8.5px] text-zinc-500 tracking-tight">
          <span>AI SERVICE: GEMINI-2.5-FLASH</span>
          <span>INGESTION CONTEXT: SECURE</span>
        </div>
      </div>
    </div>
  );
};
export default UploadPanel;
