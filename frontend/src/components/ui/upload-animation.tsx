import React from 'react';
import { motion } from 'framer-motion';

interface UploadAnimationProps {
  progress?: number;
  isUploading?: boolean;
}

// ==========================================
// 1. Glow Component: Ambient Background Halos
// ==========================================
const Glow: React.FC = () => {
  return (
    <div className="absolute inset-0 pointer-events-none flex items-center justify-center -z-10">
      {/* Primary Cyan Glow */}
      <motion.div
        animate={{
          scale: [1, 1.15, 1],
          opacity: [0.3, 0.45, 0.3],
        }}
        transition={{
          duration: 6,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-56 h-56 rounded-full bg-cyan-500/20 blur-3xl"
      />
      {/* Secondary Blue Glow */}
      <motion.div
        animate={{
          scale: [1.1, 0.9, 1.1],
          opacity: [0.2, 0.35, 0.2],
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: 'easeInOut',
        }}
        className="absolute w-64 h-64 rounded-full bg-blue-600/15 blur-3xl"
      />
    </div>
  );
};

// ==========================================
// 2. Stars Component: Twinkling 4-Point Stars
// ==========================================
const Stars: React.FC = () => {
  const starData = [
    { x: '10%', y: '25%', size: 10, delay: 0.2, duration: 3.2 },
    { x: '82%', y: '18%', size: 12, delay: 0.8, duration: 2.8 },
    { x: '18%', y: '78%', size: 8, delay: 1.4, duration: 3.5 },
    { x: '78%', y: '72%', size: 11, delay: 0.5, duration: 3.0 },
    { x: '30%', y: '12%', size: 6, delay: 2.0, duration: 4.0 },
    { x: '88%', y: '50%', size: 7, delay: 1.1, duration: 2.5 },
  ];

  return (
    <div className="absolute inset-0 pointer-events-none -z-10 overflow-hidden">
      {starData.map((star, i) => (
        <motion.svg
          key={i}
          style={{ position: 'absolute', left: star.x, top: star.y }}
          width={star.size * 2}
          height={star.size * 2}
          viewBox="0 0 24 24"
          fill="none"
          animate={{
            opacity: [0.15, 0.9, 0.15],
            scale: [0.75, 1.25, 0.75],
          }}
          transition={{
            duration: star.duration,
            repeat: Infinity,
            delay: star.delay,
            ease: 'easeInOut',
          }}
        >
          <path
            d="M12 2 Q12 12 22 12 Q12 12 12 22 Q12 12 2 12 Q12 12 12 2 Z"
            fill="rgba(165, 243, 252, 0.8)"
            className="drop-shadow-[0_0_6px_rgba(6,182,212,0.6)]"
          />
        </motion.svg>
      ))}

      {/* Minor ambient space dust particles */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={`dust-${i}`}
          style={{
            position: 'absolute',
            left: `${15 + Math.random() * 70}%`,
            top: `${10 + Math.random() * 80}%`,
            width: '2px',
            height: '2px',
          }}
          className="rounded-full bg-cyan-300/40"
          animate={{
            opacity: [0.1, 0.7, 0.1],
          }}
          transition={{
            duration: 3 + Math.random() * 4,
            repeat: Infinity,
            delay: Math.random() * 2,
          }}
        />
      ))}
    </div>
  );
};

// ==========================================
// 3. Helper Path Configs for 3D Rings
// ==========================================
const ringAngles = -12; // tilted angle matches reference image

// ==========================================
// 4. GlassFile Component: Isometric Document Card
// ==========================================
interface GlassFileProps {
  progress: number;
  isUploading: boolean;
}

const GlassFile: React.FC<GlassFileProps> = ({ progress, isUploading }) => {
  return (
    <motion.div
      style={{
        transformStyle: 'preserve-3d',
      }}
      animate={{
        y: [-6, 6, -6],
        rotateY: [-8, -12, -8],
        rotateX: [8, 12, 8],
      }}
      transition={{
        duration: 5,
        repeat: Infinity,
        ease: 'easeInOut',
      }}
      className="relative z-10 w-[140px] h-[190px] flex flex-col justify-between p-4 rounded-2xl shadow-2xl transition-all duration-300 select-none border border-cyan-400/25 bg-[#0a1128]/75 backdrop-blur-xl group hover:border-cyan-400/40"
    >
      {/* Diagonal Glass Reflection Sheen */}
      <div
        className="pointer-events-none absolute inset-0 rounded-2xl opacity-15 bg-gradient-to-tr from-transparent via-white to-transparent"
        style={{
          backgroundSize: '250% 250%',
          backgroundImage: 'linear-gradient(135deg, transparent 45%, rgba(255,255,255,0.4) 50%, transparent 55%)',
        }}
      />

      {/* Folded corner flap (top-right) */}
      <div
        className="absolute top-0 right-0 w-7 h-7 bg-cyan-950/60 border-l border-b border-cyan-400/30"
        style={{
          borderBottomLeftRadius: '6px',
          clipPath: 'polygon(0% 0%, 100% 100%, 0% 100%)',
          transform: 'rotate(-90deg)',
          transformOrigin: 'top right',
        }}
      />
      {/* Outer corner cut matching the folded flap */}
      <div
        className="absolute top-0 right-0 w-7 h-7 bg-[#020617] pointer-events-none"
        style={{
          clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%)',
        }}
      />

      {/* Inner Preview Window Outline */}
      <div className="w-10 h-10 border border-cyan-500/25 rounded-lg bg-cyan-950/20 flex items-center justify-center shrink-0">
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <path
            d="M13 2H6C5.46957 2 4.96086 2.21071 4.58579 2.58579C4.21071 2.96086 4 3.46957 4 4V20C4 20.5304 4.21071 21.0391 4.58579 21.4142C4.96086 21.7893 5.46957 22 6 22H18C18.5304 22 19.0391 21.7893 19.4142 21.4142C19.7893 21.0391 20 20.5304 20 20V9L13 2Z"
            stroke="rgba(34, 211, 238, 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M13 2V9H20"
            stroke="rgba(34, 211, 238, 0.7)"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>

      {/* File Label & Progress Info */}
      <div className="flex flex-col gap-2 mt-auto w-full">
        {/* Upload Text */}
        <div className="space-y-0.5">
          <h4 className="text-sm font-bold tracking-tight text-white font-sans">
            app.log
          </h4>
          <p className="text-[10px] text-cyan-400/75 font-semibold flex items-center gap-1">
            {isUploading ? (
              <>
                Uploading
                <span className="flex gap-0.5">
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.1 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.3 }}>.</motion.span>
                  <motion.span animate={{ opacity: [0.2, 1, 0.2] }} transition={{ repeat: Infinity, duration: 1.2, delay: 0.5 }}>.</motion.span>
                </span>
              </>
            ) : (
              'Ready'
            )}
          </p>
        </div>

        {/* Progress Bar Container */}
        {isUploading && (
          <div className="flex items-center gap-2 w-full">
            <div className="relative h-2 flex-1 bg-cyan-950/60 rounded-full overflow-hidden border border-cyan-800/25">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.3, ease: 'easeOut' }}
                className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full"
              />
            </div>
            <span className="text-[10px] font-bold text-white shrink-0">
              {progress}%
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

// ==========================================
// 5. OrbitalRings Component (Back & Front Splitting)
// ==========================================
interface OrbitalRingsProps {
  side: 'back' | 'front';
}

const OrbitalRings: React.FC<OrbitalRingsProps> = ({ side }) => {
  return (
    <svg
      className="absolute inset-0 w-full h-full pointer-events-none select-none"
      viewBox="0 0 320 240"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        {/* Ring Solid Gradient */}
        <linearGradient id="ring-glow-grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#06b6d4" stopOpacity="0.85" />
          <stop offset="40%" stopColor="#3b82f6" stopOpacity="0.30" />
          <stop offset="60%" stopColor="#1d4ed8" stopOpacity="0.20" />
          <stop offset="100%" stopColor="#06b6d4" stopOpacity="0.75" />
        </linearGradient>

        {/* Specular Highlight Filter */}
        <filter id="ring-specular-blur" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="3.5" result="blur" />
          <feMerge>
            <feMergeNode in="blur" />
            <feMergeNode in="SourceGraphic" />
          </feMerge>
        </filter>
      </defs>

      <g transform={`translate(160, 125) rotate(${ringAngles})`}>
        {side === 'back' ? (
          <>
            {/* 1. Outer Ring (Back Part) */}
            <path
              d="M 135 0 A 135 40 0 0 1 -135 0 L -123 0 A 123 36 0 0 0 123 0 Z"
              fill="url(#ring-glow-grad)"
            />
            {/* 2. Inner Ring (Back Part) */}
            <path
              d="M 110 0 A 110 32 0 0 1 -110 0 L -98 0 A 98 28 0 0 0 98 0 Z"
              fill="url(#ring-glow-grad)"
              opacity="0.8"
            />
            
            {/* 3. Glowing Streak Path (Back Top Arc) */}
            <motion.path
              d="M 130 0 A 130 38 0 0 1 -130 0"
              stroke="#e0f7fa"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#ring-specular-blur)"
              strokeDasharray="45 220"
              animate={{
                strokeDashoffset: [400, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.path
              d="M 105 0 A 105 30 0 0 1 -105 0"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#ring-specular-blur)"
              strokeDasharray="30 180"
              animate={{
                strokeDashoffset: [0, 400],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </>
        ) : (
          <>
            {/* 1. Outer Ring (Front Part) */}
            <path
              d="M -135 0 A 135 40 0 0 1 135 0 L 123 0 A 123 36 0 0 0 -123 0 Z"
              fill="url(#ring-glow-grad)"
            />
            {/* 2. Inner Ring (Front Part) */}
            <path
              d="M -110 0 A 110 32 0 0 1 110 0 L 98 0 A 98 28 0 0 0 -98 0 Z"
              fill="url(#ring-glow-grad)"
              opacity="0.8"
            />

            {/* 3. Glowing Streak Path (Front Bottom Arc) */}
            <motion.path
              d="M -130 0 A 130 38 0 0 1 130 0"
              stroke="#e0f7fa"
              strokeWidth="2"
              strokeLinecap="round"
              filter="url(#ring-specular-blur)"
              strokeDasharray="45 220"
              animate={{
                strokeDashoffset: [400, 0],
              }}
              transition={{
                duration: 5,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
            <motion.path
              d="M -105 0 A 105 30 0 0 1 105 0"
              stroke="#22d3ee"
              strokeWidth="1.5"
              strokeLinecap="round"
              filter="url(#ring-specular-blur)"
              strokeDasharray="30 180"
              animate={{
                strokeDashoffset: [0, 400],
              }}
              transition={{
                duration: 4,
                repeat: Infinity,
                ease: 'linear',
              }}
            />
          </>
        )}
      </g>
    </svg>
  );
};

// ==========================================
// 6. Main UploadAnimation Component Wrapper
// ==========================================
export const UploadAnimation: React.FC<UploadAnimationProps> = ({
  progress = 0,
  isUploading = false,
}) => {
  return (
    <div className="relative w-[320px] h-[240px] flex items-center justify-center select-none overflow-visible">
      {/* Layer 1: Ambient Background Glows */}
      <Glow />

      {/* Layer 2: Twinkling Space Stars Field */}
      <Stars />

      {/* Layer 3: Back half of Double Orbital Rings (renders behind the glass file) */}
      <OrbitalRings side="back" />

      {/* Layer 4: Glassmorphic Document Card with Gentle Floating Motion */}
      <GlassFile progress={progress} isUploading={isUploading} />

      {/* Layer 5: Front half of Double Orbital Rings (renders in front of the glass file for 3D occlusion) */}
      <OrbitalRings side="front" />
    </div>
  );
};

export default UploadAnimation;
