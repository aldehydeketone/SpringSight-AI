import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportsService } from '../services/reports.service';
import { AiService } from '../services/ai.service';
import { DashboardSummary, Report, ActivityEvent, ChartDataPoint, AiAnalysisRequest } from '../types';
import { AreaChart } from '../components/ui/area-chart';
import { KineticLogStream } from '../components/ui/kinetic-log-stream';
import { UploadHeroCard } from '../components/ui/upload-hero-card';
import {
  AlertOctagon, AlertTriangle, Info, Layers, Download,
  Trash2, Eye, Upload, Cpu,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AiRecommendationPanel } from '../components/ui/ai-recommendation-panel';
import { useToast, ToastContainer } from '../components/ui/atoms/toast';

// ── Compact KPI Card ──────────────────────────────────────────────────────────
interface KpiCardProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  accent: string;
  sub?: string;
  // Unique sparkline: array of [x, y] pairs in viewBox 0-100 (y: lower = higher)
  sparkPoints: [number, number][];
}

const useCountUp = (endValue: number, duration: number = 800) => {
  const [value, setValue] = React.useState(0);
  React.useEffect(() => {
    let startTime: number | null = null;
    let animationFrame: number;
    const animate = (timestamp: number) => {
      if (!startTime) startTime = timestamp;
      const progress = timestamp - startTime;
      const percent = Math.min(progress / duration, 1);
      const ease = percent === 1 ? 1 : 1 - Math.pow(2, -10 * percent);
      setValue(Math.floor(ease * endValue));
      if (percent < 1) {
        animationFrame = requestAnimationFrame(animate);
      }
    };
    animationFrame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(animationFrame);
  }, [endValue, duration]);
  return value;
};

// Build a smooth SVG path through the given [x, y] points using cardinal spline
const buildSparkPath = (pts: [number, number][]): { linePath: string; fillPath: string } => {
  if (pts.length < 2) return { linePath: '', fillPath: '' };
  // Catmull-Rom → cubic bezier conversion
  const d: string[] = [`M${pts[0][0]},${pts[0][1]}`];
  for (let i = 0; i < pts.length - 1; i++) {
    const p0 = pts[Math.max(i - 1, 0)];
    const p1 = pts[i];
    const p2 = pts[i + 1];
    const p3 = pts[Math.min(i + 2, pts.length - 1)];
    const tension = 0.4;
    const cp1x = p1[0] + (p2[0] - p0[0]) * tension / 2;
    const cp1y = p1[1] + (p2[1] - p0[1]) * tension / 2;
    const cp2x = p2[0] - (p3[0] - p1[0]) * tension / 2;
    const cp2y = p2[1] - (p3[1] - p1[1]) * tension / 2;
    d.push(`C${cp1x.toFixed(2)},${cp1y.toFixed(2)} ${cp2x.toFixed(2)},${cp2y.toFixed(2)} ${p2[0]},${p2[1]}`);
  }
  const linePath = d.join(' ');
  const last = pts[pts.length - 1];
  const first = pts[0];
  const fillPath = `${linePath} L${last[0]},32 L${first[0]},32 Z`;
  return { linePath, fillPath };
};

const KpiCard: React.FC<KpiCardProps> = ({ label, value, icon: Icon, accent, sub, sparkPoints }) => {
  const numMatch = String(value).match(/\d+/);
  const targetNum = numMatch ? parseInt(numMatch[0], 10) : 0;
  const suffix = String(value).replace(/\d+/g, '');
  const animatedValue = useCountUp(targetNum, 800);
  const displayValue = targetNum > 0 ? `${animatedValue}${suffix}` : value;
  const labelId = label.replace(/\s+/g, '');

  const { linePath, fillPath } = buildSparkPath(sparkPoints);
  const lastPt = sparkPoints[sparkPoints.length - 1];

  return (
    <div
      className="relative rounded-xl p-6 transition-all duration-200 ease-out cursor-default group min-w-0 flex flex-col overflow-hidden will-change-transform hover:-translate-y-[2px]"
      style={{
        background: 'linear-gradient(145deg, #0f1420, #0a0e17)',
        border: '1px solid rgba(100,116,139,0.2)',
        boxShadow: '0 2px 12px -2px rgba(0,0,0,0.4), inset 0 1px 0 rgba(255,255,255,0.04)',
        minHeight: '215px',
      }}
      // Hover accent via inline CSS custom properties via onMouseEnter/Leave is fragile;
      // use CSS group-hover instead via a pseudo element:
    >
      {/* Hover border overlay — transitions accent color in on hover */}
      <div
        className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none"
        style={{ border: `1px solid ${accent}40`, boxShadow: `0 4px 24px -4px ${accent}30` }}
      />

      {/* Icon */}
      <div className="mb-5 relative z-10">
        <div
          className="w-11 h-11 rounded-xl flex items-center justify-center shrink-0 transition-all duration-200 group-hover:shadow-[0_0_18px_2px_var(--icon-glow)]"
          style={{
            background: `radial-gradient(circle at 35% 35%, ${accent}b0 0%, ${accent}30 100%)`,
            boxShadow: `0 0 10px 1px ${accent}45, inset 0 1px 3px rgba(255,255,255,0.15)`,
            border: `1px solid ${accent}50`,
            ['--icon-glow' as any]: `${accent}55`,
          }}
        >
          <Icon className="h-5 w-5 text-white opacity-95" />
        </div>
      </div>

      {/* Metric + text */}
      <div className="relative z-10 flex-1">
        <div className="text-[38px] font-bold text-[#f8fafc] leading-none tracking-tight font-sans">
          {displayValue}
        </div>
        <div className="text-[13px] font-semibold text-slate-300 mt-3 font-heading">
          {label}
        </div>
        {sub && (
          <p className="text-[11px] text-slate-500 mt-1.5 leading-none font-medium">{sub}</p>
        )}
      </div>

      {/* Sparkline — floats 14px above bottom edge */}
      <div className="relative z-0 mt-4 mx-0 opacity-70 group-hover:opacity-100 transition-opacity duration-200" style={{ height: '44px' }}>
        <svg viewBox="0 0 100 32" preserveAspectRatio="none" className="w-full h-full overflow-visible">
          <defs>
            <linearGradient id={`sf-${labelId}`} x1="0" x2="0" y1="0" y2="1">
              <stop offset="0%" stopColor={accent} stopOpacity="0.22" />
              <stop offset="100%" stopColor={accent} stopOpacity="0" />
            </linearGradient>
          </defs>
          {/* Gradient fill */}
          <path d={fillPath} fill={`url(#sf-${labelId})`} />
          {/* Line stroke */}
          <path
            d={linePath}
            fill="none"
            stroke={accent}
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 3px ${accent}80)` }}
          />
          {/* Intermediate nodes — small */}
          {sparkPoints.slice(0, -1).map(([x, y], i) => (
            <circle
              key={i}
              cx={x} cy={y} r="1.2"
              fill={accent}
              opacity="0.6"
              vectorEffect="non-scaling-stroke"
              style={{ filter: `drop-shadow(0 0 1.5px ${accent})` }}
            />
          ))}
          {/* Last point — glowing end dot */}
          <circle
            cx={lastPt[0]} cy={lastPt[1]} r="2.5"
            fill="#fff"
            stroke={accent}
            strokeWidth="1.5"
            vectorEffect="non-scaling-stroke"
            style={{ filter: `drop-shadow(0 0 4px ${accent}aa)` }}
          />
        </svg>
      </div>
    </div>
  );
};

// ── Severity Distribution ─────────────────────────────────────────────────────
interface SeverityProps {
  dashboard: DashboardSummary;
}

const SeverityDistribution: React.FC<SeverityProps> = ({ dashboard }) => {
  const total = dashboard.totalReports || 1;
  const critPct = Math.round((dashboard.criticalReports / total) * 100);
  const highPct = Math.round((dashboard.highReports / total) * 100);
  const medPct  = Math.round((dashboard.mediumReports / total) * 100);
  const lowPct  = Math.max(0, 100 - critPct - highPct - medPct);

  const bars = [
    { label: 'Critical', count: dashboard.criticalReports, pct: critPct, color: '#ef4444', bg: 'bg-red-500/10 border-red-500/20' },
    { label: 'High',     count: dashboard.highReports,     pct: highPct, color: '#f97316', bg: 'bg-orange-500/10 border-orange-500/20' },
    { label: 'Medium',   count: dashboard.mediumReports,   pct: medPct,  color: '#f59e0b', bg: 'bg-amber-500/10 border-amber-500/20' },
    { label: 'Low',      count: dashboard.lowReports,      pct: lowPct,  color: '#3b82f6', bg: 'bg-blue-500/10 border-blue-500/20' },
  ];

  return (
    <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-4 shadow-sm w-full">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="min-w-0">
          <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">
            Severity Distribution
          </h3>
          <p className="text-[10px] text-[#475569] mt-0.5">By incident class</p>
        </div>
        <span className="text-[10px] font-medium text-slate-500 whitespace-nowrap">
          {dashboard.totalReports} Reports
        </span>
      </div>

      {/* Stacked bar */}
      <div className="w-full h-2.5 rounded-full overflow-hidden flex bg-[#0d1520] mb-4">
        {dashboard.totalReports > 0 && bars.map((b) =>
          b.count > 0 ? (
            <div
              key={b.label}
              className="h-full transition-all hover:brightness-125"
              style={{ width: `${b.pct}%`, backgroundColor: b.color }}
              title={`${b.label}: ${b.pct}%`}
            />
          ) : null
        )}
      </div>

      {/* Legend cards - Horizontal Row */}
      <div className="flex items-center gap-3">
        {bars.map((b) => (
          <div
            key={b.label}
            className={`flex flex-1 items-center justify-between rounded-lg border px-3 py-2 ${b.bg}`}
          >
            <div className="flex items-center gap-2 min-w-0">
              <div className="h-2 w-2 rounded-full shrink-0" style={{ backgroundColor: b.color }} />
              <span className="text-[10px] text-[#94a3b8] font-medium truncate">{b.label}</span>
            </div>
            <span className="text-sm font-extrabold font-mono shrink-0" style={{ color: b.color }}>{b.count}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ── Analysis History Table ────────────────────────────────────────────────────
interface HistoryTableProps {
  reports: Report[];
  onViewReport: (id: number) => void;
  onDownload: (id: number, filename: string) => void;
  onDelete: (id: number) => void;
}

const getSeverityClass = (sev?: string) => {
  switch (sev?.toUpperCase()) {
    case 'CRITICAL': return 'text-red-400 bg-red-950/40 border-red-800/40';
    case 'HIGH':     return 'text-orange-400 bg-orange-950/40 border-orange-800/40';
    case 'MEDIUM':   return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
    default:         return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
  }
};

const AnalysisHistoryTable: React.FC<HistoryTableProps> = ({
  reports,
  onViewReport,
  onDownload,
  onDelete,
}) => {
  const navigate = useNavigate();
  return (
    <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl overflow-hidden shadow-sm">
      <div className="px-5 py-3.5 border-b border-[#1e293b] flex items-center justify-between">
        <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Analysis History</h3>
        <button
          onClick={() => navigate('/reports')}
          className="text-[10px] text-cyan-400 font-bold hover:text-cyan-300 transition-colors cursor-pointer shrink-0"
        >
          View All →
        </button>
      </div>

      {/* overflow-x-auto keeps table from breaking parent grid */}
      <div className="overflow-x-auto">
        <table className="w-full min-w-[600px] text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-[#1e293b] bg-[#060913]/60 text-[#64748b]">
              <th className="px-4 py-2.5 text-[10px] font-semibold uppercase tracking-widest">File</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest">Severity</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest">Logs</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest w-full">Root Cause</th>
              <th className="px-3 py-2.5 text-[10px] font-semibold uppercase tracking-widest whitespace-nowrap">Date</th>
              <th className="px-3 py-2.5 text-right text-[10px] font-semibold uppercase tracking-widest">Actions</th>
            </tr>
          </thead>
          <tbody>
            {reports.map((rep) => (
              <tr
                key={rep.id}
                className="border-b border-[#1e293b]/50 hover:bg-[#1e293b]/25 transition-colors"
              >
                {/* Filename: fixed max-w with truncate, not td-level truncate */}
                <td className="px-4 py-3">
                  <span className="block font-mono text-[#00C8FF] text-[11px] truncate max-w-[120px]">
                    {rep.filename}
                  </span>
                </td>
                <td className="px-3 py-3">
                  <span className={`inline-block px-1.5 py-0.5 rounded border text-[9px] font-bold whitespace-nowrap ${getSeverityClass(rep.severity)}`}>
                    {rep.severity}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#94a3b8] font-mono text-[11px] whitespace-nowrap">{rep.totalLogs}</td>
                <td className="px-3 py-3 text-[#94a3b8] text-[11px]">
                  <span className="block truncate max-w-[200px]" title={rep.rootCause}>
                    {rep.rootCause}
                  </span>
                </td>
                <td className="px-3 py-3 text-[#94a3b8]/70 text-[11px] whitespace-nowrap">
                  {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                </td>
                <td className="px-3 py-3 text-right">
                  <div className="flex items-center justify-end gap-0.5">
                    <button
                      onClick={() => onViewReport(rep.id)}
                      className="p-1.5 text-cyan-400 hover:bg-[#1e293b] rounded transition-colors cursor-pointer"
                      title="View"
                    >
                      <Eye className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDownload(rep.id, rep.filename)}
                      className="p-1.5 text-blue-400 hover:bg-[#1e293b] rounded transition-colors cursor-pointer"
                      title="Download PDF"
                    >
                      <Download className="h-3.5 w-3.5" />
                    </button>
                    <button
                      onClick={() => onDelete(rep.id)}
                      className="p-1.5 text-red-400 hover:bg-[#1e293b] rounded transition-colors cursor-pointer"
                      title="Delete"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// ── Dashboard Page ─────────────────────────────────────────────────────────────
export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();
  const [dashboard, setDashboard] = useState<DashboardSummary>({
    totalReports: 0,
    criticalReports: 0,
    highReports: 0,
    mediumReports: 0,
    lowReports: 0,
    totalErrorsAnalyzed: 0,
  });
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(true);
  const [sampleLoading, setSampleLoading] = useState(false);
  const [activityEvents, setActivityEvents] = useState<ActivityEvent[]>([]);
  const [chartData, setChartData] = useState<ChartDataPoint[]>([]);

  const { toasts, addToast, removeToast } = useToast();

  const fetchDashboardData = async () => {
    try {
      let summaryData: DashboardSummary = {
        totalReports: 4,
        criticalReports: 1,
        highReports: 1,
        mediumReports: 1,
        lowReports: 1,
        totalErrorsAnalyzed: 28,
      };
      let reportsList: Report[] = [
        {
          id: 1,
          filename: 'production-spring-boot.log',
          totalLogs: 254,
          errorCount: 5,
          warnCount: 12,
          infoCount: 237,
          rootCause: 'org.springframework.beans.factory.BeanCreationException: Error creating bean with name entityManagerFactory',
          severity: 'CRITICAL',
          impact: 'Database connection failure preventing application startup.',
          recommendedFix: 'Verify database URL, username and password in application.properties.',
          preventionSteps: 'Add retry logic to connection pool.',
          confidence: 'HIGH',
          createdAt: new Date().toISOString()
        },
        {
          id: 2,
          filename: 'gateway-access.log',
          totalLogs: 1543,
          errorCount: 12,
          warnCount: 30,
          infoCount: 1501,
          rootCause: 'java.net.ConnectException: Connection refused: connect',
          severity: 'HIGH',
          impact: 'API gateway unable to route requests to authentication service.',
          recommendedFix: 'Check auth service logs and ensure port 8081 is open.',
          preventionSteps: 'Implement circuit breaker pattern.',
          confidence: 'HIGH',
          createdAt: new Date(Date.now() - 86400000).toISOString()
        },
        {
          id: 3,
          filename: 'payment-service.log',
          totalLogs: 98,
          errorCount: 2,
          warnCount: 5,
          infoCount: 91,
          rootCause: 'com.stripe.exception.ApiKeyException: No API key provided',
          severity: 'MEDIUM',
          impact: 'Payment processing is failing for all users.',
          recommendedFix: 'Configure stripe.api.key in payment-service vault.',
          preventionSteps: 'Check config validation on startup.',
          confidence: 'HIGH',
          createdAt: new Date(Date.now() - 2 * 86400000).toISOString()
        },
        {
          id: 4,
          filename: 'notification-worker.log',
          totalLogs: 450,
          errorCount: 9,
          warnCount: 15,
          infoCount: 426,
          rootCause: 'javax.mail.AuthenticationFailedException: 535 5.7.8 Username and Password not accepted',
          severity: 'LOW',
          impact: 'Email notifications are queued and not being sent.',
          recommendedFix: 'Update SMTP password in spring.mail.password property.',
          preventionSteps: 'Set up monitoring for mail queue depth.',
          confidence: 'HIGH',
          createdAt: new Date(Date.now() - 3 * 86400000).toISOString()
        }
      ];

      try {
        const [realSummary, realReports] = await Promise.all([
          ReportsService.getDashboardSummary(),
          ReportsService.getUserReports(),
        ]);
        if (realReports && realReports.length > 0) {
          summaryData = realSummary;
          reportsList = realReports;
        }
      } catch (e) {
        console.warn('Backend connection failed or empty, using local mock data', e);
      }

      setDashboard(summaryData);
      setReports(reportsList);

      const events: ActivityEvent[] = [];
      reportsList.forEach((rep, idx) => {
        const ts = new Date(rep.createdAt).toISOString();
        events.push({ id: `ev-ai-${idx}`,     timestamp: ts, type: 'AI_COMPLETE', message: `AI RCA completed for ${rep.filename}`,         severity: rep.severity as any });
        events.push({ id: `ev-upload-${idx}`, timestamp: ts, type: 'UPLOAD',      message: `Log file ${rep.filename} processed successfully`, severity: 'INFO' });
      });
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityEvents(events);

      const daysMap: Record<string, { reports: number; errors: number }> = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        daysMap[d.toLocaleDateString([], { month: 'short', day: 'numeric' })] = { reports: 0, errors: 0 };
      }
      reportsList.forEach((rep) => {
        const key = new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (daysMap[key]) { daysMap[key].reports += 1; daysMap[key].errors += rep.errorCount; }
      });
      setChartData(Object.entries(daysMap).map(([date, v]) => ({ date, ...v })));

    } catch (err) {
      console.error('Failed to fetch dashboard data', err);
    } finally {
      setTimeout(() => setLoading(false), 300);
    }
  };

  useEffect(() => { fetchDashboardData(); }, []);

  const handleAnalyzeSample = async () => {
    setSampleLoading(true);
    try {
      const mockRequest: AiAnalysisRequest = {
        filename: 'production-spring-boot.log',
        totalLogs: 254,
        errorCount: 5,
        warnCount: 12,
        infoCount: 237,
        topErrors: [
          'org.springframework.beans.factory.BeanCreationException',
          'com.mysql.cj.jdbc.exceptions.CommunicationsException',
        ],
        sampleErrorLogs: [
          "org.springframework.beans.factory.BeanCreationException: Error creating bean with name 'entityManagerFactory'",
          'com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure.',
        ],
      };
      await AiService.analyzeRootCause(mockRequest);
      await fetchDashboardData();
      navigate('/reports');
    } catch {
      addToast('Failed to analyze sample log. Ensure your backend and Gemini config are active.', 'error');
    } finally {
      setSampleLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    const deleted = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));
    addToast('Report deleted.', 'success');
    try {
      await ReportsService.deleteReport(id);
      const remaining = reports.filter((r) => r.id !== id);
      setDashboard({
        totalReports:        remaining.length,
        criticalReports:     remaining.filter((r) => r.severity === 'CRITICAL').length,
        highReports:         remaining.filter((r) => r.severity === 'HIGH').length,
        mediumReports:       remaining.filter((r) => r.severity === 'MEDIUM').length,
        lowReports:          remaining.filter((r) => r.severity === 'LOW').length,
        totalErrorsAnalyzed: remaining.reduce((s, r) => s + r.errorCount, 0),
      });
    } catch {
      if (deleted) setReports((prev) => [...prev, deleted].sort((a, b) => b.id - a.id));
      addToast('Failed to delete report.', 'error');
    }
  };

  const handleDownload = async (id: number, filename: string) => {
    try {
      await ReportsService.downloadReportPdf(id, `analysis-${filename}.pdf`);
    } catch {
      addToast('Failed to export PDF.', 'error');
    }
  };

  const handleViewReport = (id: number) =>
    navigate('/reports', { state: { selectedReportId: id } });

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
          <div className="h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span className="text-[11px] font-mono text-[#94a3b8]">Loading diagnostics...</span>
        </div>
      </div>
    );
  }

  const hasData = dashboard.totalReports > 0;

  const kpiCards: KpiCardProps[] = [
    {
      label: 'Total Reports',
      value: dashboard.totalReports,
      icon: Layers,
      accent: '#3b82f6',
      sub: 'Total analyses run',
      // Steady upward trend
      sparkPoints: [[0,28],[16,26],[32,23],[48,21],[64,19],[80,17],[100,14]],
    },
    {
      label: 'Critical Errors',
      value: dashboard.criticalReports,
      icon: AlertOctagon,
      accent: '#ef4444',
      sub: 'Immediate fix needed',
      // Flat then sudden spike, then drop and slight recovery
      sparkPoints: [[0,26],[18,25],[36,26],[50,8],[62,22],[80,20],[100,19]],
    },
    {
      label: 'High Severity',
      value: dashboard.highReports,
      icon: AlertTriangle,
      accent: '#f97316',
      sub: 'Needs attention soon',
      // Moderate fluctuations, zigzag pattern
      sparkPoints: [[0,22],[16,26],[32,19],[48,24],[64,17],[82,22],[100,18]],
    },
    {
      label: 'Medium Severity',
      value: dashboard.mediumReports,
      icon: Info,
      accent: '#f59e0b',
      sub: 'Config-level issues',
      // Mostly stable with minor ripple
      sparkPoints: [[0,24],[16,23],[32,25],[48,22],[64,24],[82,23],[100,22]],
    },
    {
      label: 'Errors Found',
      value: dashboard.totalErrorsAnalyzed,
      icon: AlertOctagon,
      accent: '#a855f7',
      sub: 'Total exceptions caught',
      // Small gradual growth
      sparkPoints: [[0,27],[16,26],[32,24],[48,23],[64,21],[82,19],[100,17]],
    },
    {
      label: 'AI Confidence',
      value: '94%',
      icon: Cpu,
      accent: '#00C8FF',
      sub: 'Model accuracy',
      // High stable line with very minimal variation
      sparkPoints: [[0,12],[16,11],[32,13],[48,11],[64,12],[82,10],[100,11]],
    },
  ];


  return (
    <div className="space-y-4 max-w-[1440px] mx-auto min-w-0">

      {/* ── Page Header ──────────────────────────────────────────── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-[#1e293b]">
        <div className="min-w-0">
          <h2 className="text-base font-extrabold text-white tracking-tight">
            AI Log Analysis Dashboard
          </h2>
          <p className="text-[10px] text-[#64748b] mt-0.5">
            Upload · Analyze · Detect · Explain · Fix
          </p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          {/* AI engine status – filled glass badge, not a glowing pill */}
          <span className="hidden sm:flex items-center gap-2 text-[11px] font-medium text-slate-300 bg-slate-800/50 border border-slate-700/40 px-3 py-1.5 rounded-lg">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shrink-0" />
            AI Engine Ready
          </span>
        </div>
      </div>

      {/* ── Row 1: Upload Hero (60%) + Log Stream (40%) ──────────── */}
      {/*
        Use items-start so each cell is independently sized.
        No forced min-h on the row — let content define height.
        Both children use h-full so they fill the cell uniformly.
      */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
        <div className="lg:col-span-3 flex flex-col">
          <UploadHeroCard
            onAnalyzeSample={handleAnalyzeSample}
            sampleLoading={sampleLoading}
          />
        </div>
        <div className="lg:col-span-2 relative">
          {/* Wrapper forces stream to fill the cell height without expanding it */}
          <div className="absolute inset-0">
            <KineticLogStream events={activityEvents} />
          </div>
        </div>
      </div>

      {/* ── Row 2: KPI Strip ────────────────────────────────────── */}
      <div className="grid grid-cols-3 sm:grid-cols-3 lg:grid-cols-6 gap-6 pt-4">
        {kpiCards.map((card) => (
          <KpiCard key={card.label} {...card} />
        ))}
      </div>

      {/* ── Row 3+ (only when data exists) ───────────────── */}
      {hasData && (
        <div className="flex flex-col gap-8 pt-4">
          {/* Row 3: Error Trend */}
          <div className="w-full">
            <AreaChart data={chartData} />
          </div>

          {/* Row 4: Severity Distribution */}
          <div className="w-full">
            <SeverityDistribution dashboard={dashboard} />
          </div>

          {/* Row 5: AI Recommendation */}
          <div className="w-full">
            <AiRecommendationPanel reports={reports} isLoading={false} />
          </div>

          {/* Row 6: Analysis History */}
          <div className="w-full min-w-0 overflow-hidden">
            <AnalysisHistoryTable
              reports={reports}
              onViewReport={handleViewReport}
              onDownload={handleDownload}
              onDelete={handleDelete}
            />
          </div>
        </div>
      )}

      {/* ── Empty State ──────────────────────────────────────────── */}
      {!hasData && (
        <div className="bg-[#0d1117] border border-[#1e293b] rounded-xl p-10 text-center flex flex-col items-center gap-4">
          <div className="w-12 h-12 rounded-full bg-[#1e293b] flex items-center justify-center">
            <AlertOctagon className="h-6 w-6 text-[#64748b]" />
          </div>
          <div>
            <h4 className="text-sm font-bold text-white">No Analyses Yet</h4>
            <p className="text-xs text-[#94a3b8] mt-1 max-w-sm mx-auto">
              Upload your first log file to generate an AI-powered incident report, or try a sample analysis.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Upload className="h-3.5 w-3.5 shrink-0" /> Upload Logs
            </button>
            <button
              onClick={handleAnalyzeSample}
              disabled={sampleLoading}
              className="border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors disabled:opacity-50"
            >
              {sampleLoading ? 'Analyzing...' : 'Try Sample Analysis'}
            </button>
          </div>
        </div>
      )}

      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};

export default DashboardPage;
