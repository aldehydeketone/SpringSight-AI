import React from 'react';

interface ShimmeringTextProps {
  text: string;
  className?: string;
}

export const ShimmeringText: React.FC<ShimmeringTextProps> = ({ text, className = '' }) => {
  return (
    <span
      className={`inline-block bg-clip-text text-transparent bg-[linear-gradient(110deg,#94a3b8,45%,#f8fafc,55%,#94a3b8)] bg-[length:250%_100%] animate-text-shimmer font-medium ${className}`}
    >
      {text}
      <style>{`
        @keyframes text-shimmer {
          to {
            background-position: -250% 0;
          }
        }
        .animate-text-shimmer {
          animation: text-shimmer 3s infinite linear;
        }
      `}</style>
    </span>
  );
};
