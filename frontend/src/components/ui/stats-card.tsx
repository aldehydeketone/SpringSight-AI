import React from 'react';
import { AnimatedCounter } from './animated-counter';

interface StatsCardProps {
  title: string;
  value: number;
  icon: React.ReactNode;
  description?: string;
  trend?: string;
  trendType?: 'up' | 'down' | 'neutral';
}

export const StatsCard: React.FC<StatsCardProps> = ({
  title,
  value,
  icon,
  description,
  trend,
  trendType = 'neutral',
}) => {
  const getTrendColor = () => {
    if (trendType === 'up') return 'text-green-400';
    if (trendType === 'down') return 'text-red-400';
    return 'text-[#94a3b8]';
  };

  return (
    <div className="bg-[#12121a] border border-[#1e293b] hover:border-blue-500/40 rounded-xl p-5 shadow-md transition-all duration-300 transform hover:-translate-y-1 hover:shadow-[0_0_15px_rgba(59,130,246,0.15)] flex items-start justify-between font-sans">
      <div className="space-y-3">
        <span className="text-xs text-[#94a3b8] uppercase font-bold tracking-wider">{title}</span>
        <div className="flex items-baseline space-x-2">
          <span className="text-2xl md:text-3xl font-extrabold text-[#f1f5f9]">
            <AnimatedCounter value={value} />
          </span>
          {trend && (
            <span className={`text-[10px] font-bold ${getTrendColor()}`}>
              {trend}
            </span>
          )}
        </div>
        {description && (
          <p className="text-[10px] text-[#94a3b8]/70">{description}</p>
        )}
      </div>

      <div className="p-2.5 bg-[#1a1a2e] rounded-lg border border-[#1e293b]/60 text-[#94a3b8]">
        {icon}
      </div>
    </div>
  );
};
