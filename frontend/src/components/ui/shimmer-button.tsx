import React from 'react';

interface ShimmerButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  shimmerColor?: string;
  duration?: number;
}

export const ShimmerButton: React.FC<ShimmerButtonProps> = ({
  children,
  className = '',
  shimmerColor = 'rgba(255, 255, 255, 0.15)',
  duration = 2.5,
  ...props
}) => {
  return (
    <button
      className={`relative overflow-hidden bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white font-medium px-6 py-3 rounded-lg shadow-lg active:scale-98 transition-transform cursor-pointer ${className}`}
      {...props}
    >
      {/* Shimmer overlay effect */}
      <span
        className="absolute inset-y-0 -left-[100%] w-[50%] skew-x-[-25deg] pointer-events-none"
        style={{
          background: `linear-gradient(to right, transparent, ${shimmerColor}, transparent)`,
          animation: `shimmer ${duration}s infinite linear`,
        }}
      />
      <span className="relative z-10 flex items-center justify-center gap-2">
        {children}
      </span>

      <style>{`
        @keyframes shimmer {
          0% {
            left: -150%;
          }
          100% {
            left: 150%;
          }
        }
      `}</style>
    </button>
  );
};
