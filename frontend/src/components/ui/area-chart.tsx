import React from 'react';
import {
  ResponsiveContainer,
  AreaChart as RechartsAreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from 'recharts';
import { ChartDataPoint } from '../../types';

interface AreaChartProps {
  data: ChartDataPoint[];
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#060913]/90 backdrop-blur-xl border border-white/[0.05] p-3.5 rounded-xl shadow-[0_8px_30px_rgba(0,0,0,0.5)] transform transition-all duration-150 ease-out pointer-events-none">
        <p className="text-[10px] font-mono text-[#64748b] mb-2.5 font-semibold tracking-wide uppercase">{label}</p>
        <div className="flex flex-col gap-2">
          {payload.map((entry: any) => (
            <div key={entry.name} className="flex items-center gap-2.5">
              <div className="w-2 h-2 rounded-full shadow-sm" style={{ backgroundColor: entry.color, boxShadow: `0 0 8px ${entry.color}80` }} />
              <span className="text-[11px] font-medium text-[#94a3b8] capitalize tracking-wide">{entry.name}</span>
              <span className="text-[12px] font-bold text-[#f1f5f9] ml-4 font-sans tracking-tight">{entry.value}</span>
            </div>
          ))}
        </div>
      </div>
    );
  }
  return null;
};

export const AreaChart: React.FC<AreaChartProps> = ({ data }) => {
  // Ensure we have some default display if data is empty
  const chartData = data.length > 0 ? data : [
    { date: 'None', reports: 0, errors: 0 }
  ];

  return (
    <div className="w-full bg-[var(--color-surface-elevated)] border border-[var(--color-surface-border)] rounded-[var(--radius-card)] p-6 shadow-[var(--shadow-elevation)] h-full flex flex-col">
      <div className="flex items-center justify-between mb-3">
        <div>
          <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Analysis &amp; Incident Trends</h3>
          <p className="text-[10px] text-[#64748b] mt-0.5">Logs processed vs exceptions over 7 days</p>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <div className="flex items-center space-x-1">
            <div className="h-2.5 w-2.5 rounded bg-blue-500" />
            <span className="text-[#94a3b8]">Reports</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="h-2.5 w-2.5 rounded bg-red-500" />
            <span className="text-[#94a3b8]">Errors</span>
          </div>
        </div>
      </div>

      <div className="w-full" style={{ height: '190px' }}>
        <ResponsiveContainer width="100%" height="100%">
          <RechartsAreaChart
            data={chartData}
            margin={{ top: 5, right: 5, left: -25, bottom: 5 }}
          >
            <defs>
              <linearGradient id="colorReports" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="colorErrors" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="4 4" stroke="#1e293b" opacity={0.3} vertical={false} />
            <XAxis
              dataKey="date"
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              dy={10}
            />
            <YAxis
              stroke="#64748b"
              fontSize={10}
              tickLine={false}
              axisLine={false}
              allowDecimals={false}
              dx={-10}
            />
            <Tooltip
              content={<CustomTooltip />}
              cursor={{ stroke: '#334155', strokeWidth: 1, strokeDasharray: '4 4' }}
              isAnimationActive={true}
              animationDuration={200}
            />
            <Area
              type="monotone"
              dataKey="reports"
              stroke="#3b82f6"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fillOpacity={1}
              fill="url(#colorReports)"
              activeDot={{ r: 6, strokeWidth: 3, stroke: '#0d1117', fill: '#60a5fa' }}
            />
            <Area
              type="monotone"
              dataKey="errors"
              stroke="#ef4444"
              strokeWidth={3}
              strokeLinecap="round"
              strokeLinejoin="round"
              fillOpacity={1}
              fill="url(#colorErrors)"
              activeDot={{ r: 6, strokeWidth: 3, stroke: '#0d1117', fill: '#f87171' }}
            />
          </RechartsAreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
};
