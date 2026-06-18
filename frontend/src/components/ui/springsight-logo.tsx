import React, { useId } from 'react';
import { cn } from '../../lib/utils';

type SpringSightLogoProps = {
  className?: string;
};

export const SpringSightLogo: React.FC<SpringSightLogoProps> = ({ className }) => {
  const id = useId().replace(/:/g, '');
  const glowId = `springsight-glow-${id}`;
  const outerGlowId = `springsight-outer-glow-${id}`;

  return (
    <div
  className={cn(
    'inline-flex items-center justify-center gap-6 opacity-95 ',
    '[filter:drop-shadow(0_0_14px_rgba(0,170,255,0.12))]',
    className
  )}
  aria-label="SpringSight AI"
>
      <svg
        className="h-[60px] w-[90px] shrink-0"
        viewBox="0 0 150 100"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <defs>
          <filter id={glowId}>
            <feGaussianBlur stdDeviation="2.5" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
          <filter id={outerGlowId}>
            <feGaussianBlur stdDeviation="4" result="coloredBlur" />
            <feMerge>
              <feMergeNode in="coloredBlur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>

        <path
          d="M8,50 Q75,5 142,50 Q75,95 8,50 Z"
          fill="#0a1628"
          stroke="#1a4a8a"
          strokeWidth="1.5"
        />
        <path
          d="M118,50 C118,24 98,10 76,15 C57,19 43,34 43,50 C43,70 57,84 76,88 C94,92 112,80 116,65"
          fill="none"
          stroke="#003a8a"
          strokeWidth="16"
          strokeLinecap="round"
        />
        <path
          d="M110,50 C110,28 93,17 75,21 C60,25 50,37 50,50 C50,66 61,77 77,80 C92,83 107,72 110,60"
          fill="none"
          stroke="#1a6abf"
          strokeWidth="11"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        <path
          d="M100,50 C100,33 87,23 74,27 C63,30 56,40 56,50 C56,63 65,71 77,73 C88,75 99,67 101,57"
          fill="none"
          stroke="#00aaee"
          strokeWidth="7"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        <path
          d="M90,50 C90,38 81,31 73,34 C66,37 62,44 62,50 C62,59 68,65 76,66 C84,67 91,61 92,54"
          fill="none"
          stroke="#00ddff"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        <circle cx="74" cy="49" r="8" fill="#003a8a" opacity="0.8" />
        <circle cx="74" cy="49" r="5.5" fill="#00ccff" filter={`url(#${outerGlowId})`} />
        <circle cx="74" cy="49" r="3" fill="#ffffff" />
        <circle cx="72" cy="47" r="1" fill="rgba(255,255,255,0.7)" />
        <path d="M8,50 Q75,5 142,50" fill="none" stroke="#0d2a52" strokeWidth="2" />
        <path d="M8,50 Q75,95 142,50" fill="none" stroke="#0d2a52" strokeWidth="2" />
        <polygon points="8,50 18,44 18,56" fill="#0a1628" />
        <polygon points="142,50 132,44 132,56" fill="#0a1628" />
      </svg>

      <div className="flex items-center gap-2.5">
        <div className="flex items-baseline whitespace-nowrap">
          <span
            className="font-['Exo_2',Arial,sans-serif] text-[2.4rem] font-extrabold italic leading-none tracking-[-0.02em] text-white"
            style={{ textShadow: '0 0 30px rgba(0,180,255,0.3)' }}
          >
            Spring
          </span>
          <span
            className="font-['Exo_2',Arial,sans-serif] text-[2.4rem] font-extrabold italic leading-none tracking-[-0.02em] text-[#00aaff]"
            style={{ textShadow: '0 0 20px rgba(0,170,255,0.5)' }}
          >
            Sight
          </span>
        </div>
        <span className="rounded-lg bg-gradient-to-br from-[#0088dd] to-[#00ccff] px-3 py-1 font-['Exo_2',Arial,sans-serif] text-[0.85rem] font-extrabold leading-none tracking-[0.08em] text-white shadow-[0_0_12px_rgba(0,180,255,0.4)]">
          AI
        </span>
      </div>
    </div>
  );
};

export default SpringSightLogo;
