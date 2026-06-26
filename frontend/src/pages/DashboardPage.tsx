import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ReportsService } from '../services/reports.service';
import { AiService } from '../services/ai.service';
import { DashboardSummary, Report, ActivityEvent, ChartDataPoint, AiAnalysisRequest } from '../types';
import { AreaChart } from '../components/ui/area-chart';
import { KineticLogStream } from '../components/ui/kinetic-log-stream';
import {
  AlertOctagon, AlertTriangle, Info, Layers, Download,
  Trash2, Eye, ArrowRight, Upload, Cpu, FileCode,
  ShieldAlert, Terminal, Activity
} from 'lucide-react';
import { motion } from 'framer-motion';
import { AiRecommendationPanel } from '../components/ui/ai-recommendation-panel';
import { useToast, ToastContainer } from '../components/ui/atoms/toast';

interface StatCardNewProps {
  label: string;
  value: string | number;
  icon: React.ComponentType<any>;
  accentColor: string;
  description?: string;
}

const StatCardNew: React.FC<StatCardNewProps> = ({ label, value, icon: Icon, accentColor, description }) => (
  <motion.div
    className="bg-[#1E293B] rounded-xl p-5 border border-[#334155] hover:border-[#00C8FF]/30 transition-colors duration-200 cursor-default"
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    whileHover={{ scale: 1.02, y: -2 }}
    transition={{ type: 'spring', stiffness: 300, damping: 25 }}
  >
    <div className="flex items-start justify-between mb-3">
      <div
        className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0"
        style={{ backgroundColor: accentColor + '1a' }}
      >
        <Icon className="h-4 w-4" style={{ color: accentColor }} />
      </div>
      <span className="text-[10px] font-semibold uppercase tracking-widest text-[#64748B]">
        {label}
      </span>
    </div>
    <div className="text-[28px] font-bold text-[#F8FAFC] leading-tight tracking-tight">
      {value}
    </div>
    {description && (
      <p className="text-xs text-[#64748B] mt-1">{description}</p>
    )}
  </motion.div>
);

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
      const [summaryData, reportsList] = await Promise.all([
        ReportsService.getDashboardSummary(),
        ReportsService.getUserReports(),
      ]);

      setDashboard(summaryData);
      setReports(reportsList);

      // Generate activity events dynamically from reports list to ensure real events
      const events: ActivityEvent[] = [];
      reportsList.forEach((rep, idx) => {
        const formattedDate = new Date(rep.createdAt).toISOString();
        
        events.push({
          id: `ev-ai-${idx}`,
          timestamp: formattedDate,
          type: 'AI_COMPLETE',
          message: `AI Root Cause Analysis completed for ${rep.filename}`,
          severity: rep.severity as any,
        });

        events.push({
          id: `ev-upload-${idx}`,
          timestamp: formattedDate,
          type: 'UPLOAD',
          message: `Log file ${rep.filename} processed successfully`,
          severity: 'INFO',
        });
      });

      // Sort events chronologically, newest first
      events.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
      setActivityEvents(events);

      // Generate Chart Trends dynamically (last 7 days)
      const daysMap: { [key: string]: { reports: number; errors: number } } = {};
      for (let i = 6; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toLocaleDateString([], { month: 'short', day: 'numeric' });
        daysMap[dateStr] = { reports: 0, errors: 0 };
      }

      reportsList.forEach((rep) => {
        const dateStr = new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' });
        if (daysMap[dateStr]) {
          daysMap[dateStr].reports += 1;
          daysMap[dateStr].errors += rep.errorCount;
        }
      });

      const trendPoints: ChartDataPoint[] = Object.keys(daysMap).map((key) => ({
        date: key,
        reports: daysMap[key].reports,
        errors: daysMap[key].errors,
      }));
      setChartData(trendPoints);

    } catch (err) {
      console.error('Failed to fetch dashboard summary', err);
    } finally {
      setTimeout(() => setLoading(false), 300); // min 300ms skeleton
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

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
          'com.mysql.cj.jdbc.exceptions.CommunicationsException'
        ],
        sampleErrorLogs: [
          'org.springframework.beans.factory.BeanCreationException: Error creating bean with name \'entityManagerFactory\': Invocation of init method failed; nested exception is org.hibernate.service.spi.ServiceException: Unable to create requested service [org.hibernate.engine.jdbc.env.spi.JdbcEnvironment]',
          'com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure. The last packet successfully received from the server was 0 milliseconds ago. The driver has not received any packets from the server.'
        ]
      };

      await AiService.analyzeRootCause(mockRequest);
      await fetchDashboardData();
      navigate('/reports');
    } catch (err) {
      alert('Failed to analyze sample log. Ensure your backend and Gemini config are active.');
    } finally {
      setSampleLoading(false);
    }
  };

  const getSeverityColor = (sev?: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-950/40 border-red-800/40';
      case 'HIGH':
        return 'text-orange-400 bg-orange-950/40 border-orange-800/40';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
      default:
        return 'text-blue-400 bg-blue-950/40 border-blue-800/40';
    }
  };

  const handleDelete = async (id: number) => {
    // 1. Optimistic — remove immediately
    const deletedReport = reports.find((r) => r.id === id);
    setReports((prev) => prev.filter((r) => r.id !== id));

    // 2. Show toast
    addToast('Report deleted.', 'success');

    try {
      await ReportsService.deleteReport(id);
      // Update dashboard counts
      const newReports = reports.filter((r) => r.id !== id);
      setDashboard({
        totalReports: newReports.length,
        criticalReports: newReports.filter((r) => r.severity === 'CRITICAL').length,
        highReports: newReports.filter((r) => r.severity === 'HIGH').length,
        mediumReports: newReports.filter((r) => r.severity === 'MEDIUM').length,
        lowReports: newReports.filter((r) => r.severity === 'LOW').length,
        totalErrorsAnalyzed: newReports.reduce((acc, r) => acc + r.errorCount, 0),
      });
    } catch (err) {
      // Revert on failure
      if (deletedReport) {
        setReports((prev) => [...prev, deletedReport].sort((a, b) => b.id - a.id));
      }
      addToast('Failed to delete report.', 'error');
    }
  };

  const handleDownloadPdf = async (id: number, filename: string) => {
    try {
      await ReportsService.downloadReportPdf(id, `analysis-${filename}.pdf`);
    } catch (err) {
      alert('Failed to export PDF.');
    }
  };

  // Severity Distribution Calculations
  const totalReportsCount = dashboard.totalReports || 1;
  const criticalPct = Math.round((dashboard.criticalReports / totalReportsCount) * 100);
  const highPct = Math.round((dashboard.highReports / totalReportsCount) * 100);
  const mediumPct = Math.round((dashboard.mediumReports / totalReportsCount) * 100);
  const lowPct = Math.max(0, 100 - (criticalPct + highPct + mediumPct));

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-xs">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span className="text-[#94a3b8]">Loading diagnostics dashboard...</span>
        </div>
      </div>
    );
  }

  const hasNoData = dashboard.totalReports === 0;

  return (
    <div className="space-y-8 max-w-7xl mx-auto">
      {/* Title & Product Identity */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-[#1e293b] pb-6">
        <div>
          <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-2">
            AI Log Analysis & Root Cause Detection
          </h2>
          <p className="text-xs text-[#94a3b8] mt-0.5">
            Identify critical exceptions, analyze incident severity trends, and view AI recommendations.
          </p>
        </div>
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate('/upload')}
            className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5 shadow-lg shadow-blue-600/10"
          >
            <Upload className="h-3.5 w-3.5" />
            Upload Log File
          </button>
          <button
            onClick={handleAnalyzeSample}
            disabled={sampleLoading}
            className="border border-cyan-500/30 bg-cyan-950/20 text-cyan-400 hover:bg-cyan-950/40 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
          >
            <Terminal className="h-3.5 w-3.5" />
            {sampleLoading ? 'Analyzing Sample...' : 'Analyze Sample Log'}
          </button>
        </div>
      </div>

      {/* Recruiter & First-Time Visitor Walkthrough Visualization */}
      <section className="bg-[#12121a] border border-[#1e293b] rounded-xl p-5 shadow-lg space-y-4">
        <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Log Analysis Core Workflow</h3>
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4 text-center font-mono text-[10px] relative">
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <Upload className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">1. Upload</span>
            <span className="text-[#94a3b8]/60">Send app logs</span>
          </div>
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <FileCode className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">2. Parse</span>
            <span className="text-[#94a3b8]/60">Extract lines</span>
          </div>
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <ShieldAlert className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">3. Detect</span>
            <span className="text-[#94a3b8]/60">Find anomalies</span>
          </div>
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <Cpu className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">4. AI Analysis</span>
            <span className="text-[#94a3b8]/60">Find root causes</span>
          </div>
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <Activity className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">5. Diagnose</span>
            <span className="text-[#94a3b8]/60">Get fixes</span>
          </div>
          <div className="bg-[#1a1a2e]/55 border border-[#1e293b] p-3 rounded-lg flex flex-col items-center justify-center">
            <Download className="h-4 w-4 text-cyan-400 mb-1" />
            <span className="font-bold text-white mb-0.5">6. Export</span>
            <span className="text-[#94a3b8]/60">Download PDF</span>
          </div>
        </div>
      </section>

      {/* Empty States / Main Stats */}
      {hasNoData ? (
        <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[300px] space-y-4">
          <AlertOctagon className="h-12 w-12 text-[#94a3b8]/40" />
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-white">No Analyses Yet</h4>
            <p className="text-xs text-[#94a3b8] max-w-sm mx-auto">
              Upload your first log file to generate an AI-powered incident report, or run a simulated analysis using a sample file.
            </p>
          </div>
          <div className="flex items-center space-x-3">
            <button
              onClick={() => navigate('/upload')}
              className="bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Upload className="h-4 w-4" />
              Upload Logs
            </button>
            <button
              onClick={handleAnalyzeSample}
              disabled={sampleLoading}
              className="border border-[#1e293b] bg-[#161622] hover:bg-[#1a1a2e] text-cyan-400 text-xs font-bold px-4 py-2 rounded-lg cursor-pointer transition-colors flex items-center gap-1.5"
            >
              <Terminal className="h-4 w-4" />
              {sampleLoading ? 'Analyzing Sample...' : 'Analyze Sample Log'}
            </button>
          </div>
        </div>
      ) : (
        <>
          {/* Stats Cards Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-3 gap-4">
            {loading ? (
              // 6 skeleton cards while loading
              Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="bg-[#1E293B] rounded-xl p-5 border border-[#334155] animate-pulse">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-lg bg-[#263145]" />
                    <div className="w-16 h-4 rounded bg-[#263145]" />
                  </div>
                  <div className="w-24 h-8 rounded bg-[#263145] mb-2" />
                  <div className="w-32 h-3 rounded bg-[#263145]" />
                </div>
              ))
            ) : (
              <>
                {/* Card 1 — Incident Investigations */}
                <StatCardNew
                  label="Incident Investigations"
                  value={dashboard.totalReports}
                  icon={Layers}
                  accentColor="#3B82F6"
                  description="Analyses generated"
                />
                {/* Card 2 — Critical Incidents */}
                <StatCardNew
                  label="Critical Incidents"
                  value={dashboard.criticalReports}
                  icon={AlertOctagon}
                  accentColor="#EF4444"
                  description="Requires immediate hotfix"
                />
                {/* Card 3 — High Severity */}
                <StatCardNew
                  label="High Severity"
                  value={dashboard.highReports}
                  icon={AlertTriangle}
                  accentColor="#F97316"
                  description="Warning states"
                />
                {/* Card 4 — Medium Severity */}
                <StatCardNew
                  label="Medium Severity"
                  value={dashboard.mediumReports}
                  icon={Info}
                  accentColor="#F59E0B"
                  description="Config warnings"
                />
                {/* Card 5 — Errors Analyzed */}
                <StatCardNew
                  label="Errors Analyzed"
                  value={dashboard.totalErrorsAnalyzed}
                  icon={AlertOctagon}
                  accentColor="#F97316"
                  description="Exceptions detected"
                />
                {/* Card 6 — AI Confidence STATIC */}
                <StatCardNew
                  label="AI Confidence"
                  value="94%"
                  icon={Cpu}
                  accentColor="#00C8FF"
                  description="High confidence"
                />
              </>
            )}
          </div>

          {/* ── AI Recommendation Panel ── */}
          <AiRecommendationPanel reports={reports} isLoading={loading} />

          {/* Main Grid: Charts & Activity */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <AreaChart data={chartData} />
            </div>
            <div>
              <KineticLogStream events={activityEvents} />
            </div>
          </div>
        </>
      )}

      {/* Severity Distribution & Recent Incidents Table */}
      {!hasNoData && (
        <div className="grid grid-cols-1 gap-6">
          {/* Severity Distribution Visualizer */}
          <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-5 shadow-lg space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Incident Severity Distribution</h3>
                <p className="text-[10px] text-[#94a3b8]">Percentage makeup of incident severity classes</p>
              </div>
              <span className="text-[10px] font-mono text-cyan-400 font-bold">Total: {dashboard.totalReports} incidents</span>
            </div>

            {/* Stacked bar */}
            <div className="w-full bg-[#0a0a0f] h-3.5 rounded-full overflow-hidden flex border border-[#1e293b]/60">
              {dashboard.totalReports > 0 && (
                <>
                  {dashboard.criticalReports > 0 && (
                    <div
                      className="bg-red-500 h-full transition-all hover:brightness-110"
                      style={{ width: `${criticalPct}%` }}
                      title={`Critical: ${criticalPct}%`}
                    />
                  )}
                  {dashboard.highReports > 0 && (
                    <div
                      className="bg-orange-500 h-full transition-all hover:brightness-110"
                      style={{ width: `${highPct}%` }}
                      title={`High: ${highPct}%`}
                    />
                  )}
                  {dashboard.mediumReports > 0 && (
                    <div
                      className="bg-yellow-500 h-full transition-all hover:brightness-110"
                      style={{ width: `${mediumPct}%` }}
                      title={`Medium: ${mediumPct}%`}
                    />
                  )}
                  {dashboard.lowReports > 0 && (
                    <div
                      className="bg-blue-500 h-full transition-all hover:brightness-110"
                      style={{ width: `${lowPct}%` }}
                      title={`Low: ${lowPct}%`}
                    />
                  )}
                </>
              )}
            </div>

            {/* Legend */}
            <div className="flex flex-wrap gap-4 text-[10px] font-mono">
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-red-500" />
                <span className="text-[#f1f5f9]">Critical ({dashboard.criticalReports})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-orange-500" />
                <span className="text-[#f1f5f9]">High ({dashboard.highReports})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-yellow-500" />
                <span className="text-[#f1f5f9]">Medium ({dashboard.mediumReports})</span>
              </div>
              <div className="flex items-center space-x-1.5">
                <div className="h-2 w-2 rounded-full bg-blue-500" />
                <span className="text-[#f1f5f9]">Low ({dashboard.lowReports})</span>
              </div>
            </div>
          </div>

          {/* Reports History Table */}
          <div className="bg-[#12121a] border border-[#1e293b] rounded-xl overflow-hidden shadow-lg">
            <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between">
              <h3 className="text-xs font-semibold text-[#f1f5f9] uppercase tracking-wider">Analysis History</h3>
              <button
                onClick={() => navigate('/reports')}
                className="text-[10px] text-cyan-400 font-bold hover:underline cursor-pointer"
              >
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-[#1E293B] bg-[#263145]/40 text-[#64748B]">
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest">FILE</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest">SEVERITY</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest">LOGS</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest">ROOT CAUSE</th>
                    <th className="px-5 py-3 text-[11px] font-semibold uppercase tracking-widest">DATE</th>
                    <th className="px-5 py-3 text-right text-[11px] font-semibold uppercase tracking-widest">ACTIONS</th>
                  </tr>
                </thead>
                <tbody>
                  {reports.map((rep) => (
                    <tr
                      key={rep.id}
                      className="border-b border-[#1e293b]/55 hover:bg-[#263145]/60 transition-colors"
                    >
                      <td className="px-5 py-3.5 font-mono text-[#00C8FF] text-[13px] truncate max-w-[160px]">{rep.filename}</td>
                      <td className="px-5 py-3.5">
                        <span className={`px-2 py-0.5 rounded border text-[9px] font-bold ${getSeverityColor(rep.severity)}`}>
                          {rep.severity}
                        </span>
                      </td>
                      <td className="px-5 py-3.5 text-[#94a3b8] font-mono">{rep.totalLogs} entries</td>
                      <td className="px-5 py-3.5 text-[#94a3b8] truncate max-w-[200px]" title={rep.rootCause}>
                        {rep.rootCause}
                      </td>
                      <td className="px-5 py-3.5 text-[#94a3b8]/70">
                        {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end space-x-1.5">
                          <button
                            onClick={() => navigate('/reports', { state: { selectedReportId: rep.id } })}
                            className="p-1 text-cyan-400 hover:bg-[#1a1a2e] rounded transition-colors cursor-pointer"
                            title="View Details"
                          >
                            <Eye className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDownloadPdf(rep.id, rep.filename)}
                            className="p-1 text-blue-400 hover:bg-[#1E293B] rounded transition-colors cursor-pointer"
                            title="Download PDF"
                          >
                            <Download className="h-4 w-4" />
                          </button>
                          <button
                            onClick={() => handleDelete(rep.id)}
                            className="p-1 text-red-400 hover:bg-[#1a1a2e] rounded transition-colors cursor-pointer"
                            title="Delete"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
      <ToastContainer toasts={toasts} removeToast={removeToast} />
    </div>
  );
};
export default DashboardPage;
