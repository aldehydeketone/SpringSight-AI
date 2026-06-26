import React from 'react';

interface SkeletonProps {
  width?: string | number;
  height?: string | number;
  className?: string;
}

export const Skeleton: React.FC<SkeletonProps> = ({ width, height, className = '' }) => {
  return (
    <div
      className={`animate-pulse bg-[#263145] rounded-lg ${className}`}
      style={{ width, height }}
    />
  );
};

export default Skeleton;
