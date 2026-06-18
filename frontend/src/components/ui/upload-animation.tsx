import React from 'react';
import { FileText, Sparkles, Cpu, Activity } from 'lucide-react';

interface UploadAnimationProps {
  progress?: number;
  isUploading?: boolean;
}

export const UploadAnimation: React.FC<UploadAnimationProps> = ({
  progress = 0,
  isUploading = false,
}) => {
  return (
    <div className="relative w-48 h-48 flex items-center justify-center select-none font-mono">
      {/* Background Radial Glow */}
      <div className="absolute w-36 h-36 rounded-full bg-gradient-to-r from-blue-500/20 to-cyan-500/20 blur-xl animate-pulse" />

      {/* Orbit Rings and Orbiting Dots */}
      <div className="absolute inset-0 rounded-full border border-blue-500/10 pointer-events-none animate-[spin_12s_linear_infinite]" />
      <div className="absolute inset-4 rounded-full border border-cyan-500/10 pointer-events-none animate-[spin_8s_linear_infinite_reverse]" />

      {/* Orbiting Dot 1: AI (Cpu icon / Sparkles representation) */}
      <div className="absolute inset-0 animate-[spin_10s_linear_infinite] pointer-events-none">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="h-6 w-6 rounded-full bg-blue-600 border border-blue-400 flex items-center justify-center shadow-lg shadow-blue-500/50">
            <Cpu className="h-3 w-3 text-white" />
          </div>
          <span className="text-[8px] text-blue-400 font-bold mt-1 bg-[#0a0a0f] px-1 py-0.5 rounded border border-blue-500/30">AI</span>
        </div>
      </div>

      {/* Orbiting Dot 2: Analysis */}
      <div className="absolute inset-0 animate-[spin_7s_linear_infinite_reverse] pointer-events-none">
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2 translate-y-1/2 flex flex-col items-center">
          <div className="h-6 w-6 rounded-full bg-cyan-600 border border-cyan-400 flex items-center justify-center shadow-lg shadow-cyan-500/50">
            <Sparkles className="h-3 w-3 text-white" />
          </div>
          <span className="text-[8px] text-cyan-400 font-bold mt-1 bg-[#0a0a0f] px-1 py-0.5 rounded border border-cyan-500/30">Analysis</span>
        </div>
      </div>

      {/* Orbiting Dot 3: Monitoring */}
      <div className="absolute inset-0 animate-[spin_13s_linear_infinite] pointer-events-none" style={{ animationDelay: '-3s' }}>
        <div className="absolute top-1/2 left-0 -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
          <div className="h-6 w-6 rounded-full bg-purple-600 border border-purple-400 flex items-center justify-center shadow-lg shadow-purple-500/50">
            <Activity className="h-3 w-3 text-white" />
          </div>
          <span className="text-[8px] text-purple-400 font-bold mt-1 bg-[#0a0a0f] px-1 py-0.5 rounded border border-purple-500/30">Monitor</span>
        </div>
      </div>

      {/* Floating File Icon */}
      <div className="relative z-10 flex flex-col items-center animate-[float-rotate_4s_ease-in-out_infinite]">
        <div className="relative bg-[#161622] border border-[#1e293b] p-5 rounded-2xl shadow-2xl flex flex-col items-center w-24">
          <FileText className="h-10 w-10 text-cyan-400 animate-pulse" />
          <span className="text-[10px] text-[#f1f5f9] mt-2 font-bold font-mono">app.log</span>
          
          {isUploading && (
            <div className="w-full mt-3 space-y-1.5">
              {/* Progress bar */}
              <div className="w-full bg-[#0a0a0f] h-1 rounded-full overflow-hidden">
                <div
                  className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-[8px] text-cyan-400 font-bold block text-center">
                {progress}%
              </span>
            </div>
          )}
        </div>
      </div>

      <style>{`
        @keyframes float-rotate {
          0% {
            transform: translateY(-8px) rotate(-3.5deg);
          }
          50% {
            transform: translateY(8px) rotate(-2deg);
          }
          100% {
            transform: translateY(-8px) rotate(-3.5deg);
          }
        }
      `}</style>
    </div>
  );
};
