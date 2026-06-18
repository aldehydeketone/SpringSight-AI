import React from 'react';

interface ShineBorderProps {
  children: React.ReactNode;
  className?: string;
  color?: string[];
  borderWidth?: number;
  duration?: number;
  borderRadius?: number;
}

export const ShineBorder: React.FC<ShineBorderProps> = ({
  children,
  className = '',
  color = ['#3b82f6', '#06b6d4'],
  borderWidth = 2,
  duration = 8,
  borderRadius = 12,
}) => {
  return (
    <div
      className={`relative p-[1px] overflow-hidden ${className}`}
      style={{
        borderRadius: `${borderRadius}px`,
      }}
    >
      {/* Animated Shine Layer */}
      <div
        className="absolute inset-0 pointer-events-none opacity-60"
        style={{
          background: `conic-gradient(from 0deg, ${color.join(', ')})`,
          animation: `shine-rotate ${duration}s linear infinite`,
          margin: `-${borderWidth}px`,
        }}
      />
      {/* Background Mask */}
      <div
        className="relative h-full w-full bg-[#12121a] flex flex-col"
        style={{
          borderRadius: `${borderRadius - 1}px`,
        }}
      >
        {children}
      </div>

      <style>{`
        @keyframes shine-rotate {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
      `}</style>
    </div>
  );
};
