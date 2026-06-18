import React from 'react';

interface DashboardCardProps {
  title?: string;
  subtitle?: string;
  headerAction?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}

export const DashboardCard: React.FC<DashboardCardProps> = ({
  title,
  subtitle,
  headerAction,
  children,
  className = '',
}) => {
  return (
    <div className={`bg-[#12121a] border border-[#1e293b] rounded-xl p-5 shadow-lg flex flex-col font-sans ${className}`}>
      {(title || subtitle || headerAction) && (
        <div className="flex items-center justify-between border-b border-[#1e293b]/60 pb-3 mb-4">
          <div>
            {title && <h3 className="text-sm font-semibold text-[#f1f5f9]">{title}</h3>}
            {subtitle && <p className="text-[10px] text-[#94a3b8]">{subtitle}</p>}
          </div>
          {headerAction && <div>{headerAction}</div>}
        </div>
      )}
      <div className="flex-1">{children}</div>
    </div>
  );
};
