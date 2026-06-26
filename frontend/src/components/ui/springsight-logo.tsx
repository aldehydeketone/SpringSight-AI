import React, { useId } from 'react';
import { cn } from '../../lib/utils';

type SpringSightLogoProps = {
  /** 'default' — full-size for auth pages / standalone use.
   *  'sm'      — sidebar-fit rendered via actual element sizing,
   *              NOT CSS transforms, so layout flow is correct. */
  size?: 'default' | 'sm';
  className?: string;
};

export const SpringSightLogo: React.FC<SpringSightLogoProps> = ({
  size = 'default',
  className,
}) => {
  const id = useId().replace(/:/g, '');
  const glowId = `glow-${id}`;
  const outerGlowId = `outerGlow-${id}`;

  const isSm = size === 'sm';

  // Precise sizing and spacing based on design specs
  const svgWidth = isSm ? 60 : 72;
  const svgHeight = isSm ? 40 : 48;
  
  // Proportional gap (20px at default -> scaled proportionally)
  const gap = isSm ? '13px' : '20px';

  // Fonts and Badge scaling
  const textStyle: React.CSSProperties = {
    fontFamily: "'Exo 2', Arial, sans-serif",
    fontSize: isSm ? '1.5rem' : '52px',
    fontWeight: 900,
    fontStyle: 'italic',
    letterSpacing: isSm ? '-0.46px' : '-1px',
    lineHeight: 1,
  };

  const springStyle: React.CSSProperties = {
    ...textStyle,
    color: '#ffffff',
    textShadow: '0 0 30px rgba(0,180,255,0.3)',
  };

  const sightStyle: React.CSSProperties = {
    ...textStyle,
    color: '#00aaff',
    textShadow: '0 0 20px rgba(0,170,255,0.5)',
  };

  const badgeStyle: React.CSSProperties = {
    background: 'linear-gradient(135deg, #0088dd, #00ccff)',
    color: '#ffffff',
    fontFamily: "'Exo 2', Arial, sans-serif",
    fontSize: isSm ? '8px' : '17px',
    fontWeight: 900,
    padding: isSm ? '2px 5px' : '4px 10px',
    borderRadius: isSm ? '4px' : '8px',
    marginLeft: isSm ? '5px' : '10px',
    marginBottom: isSm ? '2px' : '4px',
    letterSpacing: isSm ? '0.5px' : '1px',
    boxShadow: '0 0 12px rgba(0,180,255,0.4)',
    lineHeight: 1,
  };

  return (
    <div
      className={cn(
        'inline-flex items-center justify-center select-none',
        className
      )}
      style={{ gap }}
      aria-label="SpringSight AI"
    >
      {/* Eye SVG — exact brand paths, filters, outline stroke, edge lines, and corner tips */}
      <svg
        width={svgWidth}
        height={svgHeight}
        viewBox="0 0 150 100"
        xmlns="http://www.w3.org/2000/svg"
        className="shrink-0"
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

        {/* Eye outer shape with blue border on dark bg */}
        <path
          d="M8,50 Q75,5 142,50 Q75,95 8,50 Z"
          fill="#0a1628"
          stroke="#d8e9ff"
          strokeWidth="2"
        />

        {/* Swirl arcs - outermost dark blue */}
        <path
          d="M118,50 C118,24 98,10 76,15 C57,19 43,34 43,50 C43,70 57,84 76,88 C94,92 112,80 116,65"
          fill="none"
          stroke="#003a8a"
          strokeWidth="16"
          strokeLinecap="round"
        />
        {/* Mid blue */}
        <path
          d="M110,50 C110,28 93,17 75,21 C60,25 50,37 50,50 C50,66 61,77 77,80 C92,83 107,72 110,60"
          fill="none"
          stroke="#1a6abf"
          strokeWidth="11"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {/* Bright cyan */}
        <path
          d="M100,50 C100,33 87,23 74,27 C63,30 56,40 56,50 C56,63 65,71 77,73 C88,75 99,67 101,57"
          fill="none"
          stroke="#00aaee"
          strokeWidth="7"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />
        {/* Inner highlight */}
        <path
          d="M90,50 C90,38 81,31 73,34 C66,37 62,44 62,50 C62,59 68,65 76,66 C84,67 91,61 92,54"
          fill="none"
          stroke="#00ddff"
          strokeWidth="4.5"
          strokeLinecap="round"
          filter={`url(#${glowId})`}
        />

        {/* Center pupil glow */}
        <circle cx="74" cy="49" r="8" fill="#003a8a" opacity="0.8" />
        <circle cx="74" cy="49" r="5.5" fill="#00ccff" filter={`url(#${outerGlowId})`} />
        <circle cx="74" cy="49" r="3" fill="#ffffff" />
        <circle cx="72" cy="47" r="1" fill="rgba(255,255,255,0.7)" />

        {/* Eye edge lines */}
        <path d="M8,50 Q75,5 142,50" fill="none" stroke="#b7d5ff" strokeWidth="2" />
        <path d="M8,50 Q75,95 142,50" fill="none" stroke="#b7d5ff" strokeWidth="2" />

        {/* Eye corner sharp tips */}
        <polygon points="8,50 18,44 18,56" fill="#0a1628" />
        <polygon points="142,50 132,44 132,56" fill="#0a1628" />
      </svg>

      {/* Wordmark + badge */}
      <div className="flex items-baseline whitespace-nowrap">
        <span style={springStyle}>Spring</span>
        <span style={sightStyle}>Sight</span>
        <span style={badgeStyle}>AI</span>
      </div>
    </div>
  );
};

export default SpringSightLogo;
