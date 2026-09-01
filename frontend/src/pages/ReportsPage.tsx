import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ReportsService } from '../services/reports.service';
import { Report } from '../types';
import {
  MagnifyingGlass,
  CalendarBlank,
  WarningOctagon,
  DownloadSimple,
  Trash,
  ShieldCheck,
  CheckCircle,
  FileText,
  Copy,
  Check,
  Lightning,
  Clock,
  Stack,
  Sparkle,
} from '@phosphor-icons/react';
import { GlowCard } from '../components/ui/glow-card';

export const ReportsPage: React.FC = () => {
  const location = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);
  const [copiedSection, setCopiedSection] = useState<string | null>(null);

  const getReportTitle = (rep: Report) => {
    const root = rep.rootCause?.toLowerCase() || '';
    let name = 'Application Exception Detected';

    if (root.includes('connection') || root.includes('database') || root.includes('communications') || root.includes('refused')) {
      name = 'Database Connection Timeout Failure';
    } else if (root.includes('bean') || root.includes('beancreation') || root.includes('instantiation')) {
      name = 'Spring Bean Instantiation Exception';
    } else if (root.includes('jwt') || root.includes('signature') || root.includes('token') || root.includes('expired')) {
      name = 'JWT Signature Security Exception';
    } else if (root.includes('nullpointer') || root.includes('null pointer') || root.includes('dereference')) {
      name = 'NullPointerException Null Object Reference';
    } else if (root.includes('hibernate') || root.includes('sql') || root.includes('grammar') || root.includes('syntax')) {
      name = 'Hibernate ORM SQL Syntax Grammar Failure';
    } else if (root.includes('timeout') || root.includes('socket')) {
      name = 'Network Socket Dial Connection Timeout';
    }

    return name;
  };

  const fetchReports = async () => {
    try {
      const list = await ReportsService.getUserReports();
      setReports(list);

      const stateReportId = location.state?.selectedReportId;
      if (stateReportId) {
        const found = list.find((r) => r.id === Number(stateReportId));
        if (found) {
          setSelectedReport(found);
        } else if (list.length > 0) {
          setSelectedReport(list[0]);
        }
      } else if (list.length > 0) {
        setSelectedReport(list[0]);
      }
    } catch (err) {
      console.error('Failed to load reports', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReports();
  }, [location.state]);

  const handleDelete = async (id: number) => {
    if (window.confirm('Delete this incident report?')) {
      try {
        await ReportsService.deleteReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
      } catch (err) {
        alert('Failed to delete report.');
      }
    }
  };

  const handleDownloadPdf = async (rep: Report) => {
    try {
      await ReportsService.downloadReportPdf(rep.id, `analysis-${rep.filename}.pdf`);
    } catch (err) {
      alert('Failed to export PDF.');
    }
  };

  const handleCopyText = (text: string, sectionId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSection(sectionId);
    setTimeout(() => setCopiedSection(null), 2000);
  };

  const getSeverityBadgeClass = (sev?: string) => {
    switch (sev?.toUpperCase()) {
      case 'CRITICAL':
        return 'text-red-400 bg-red-500/10 border-red-500/30';
      case 'HIGH':
        return 'text-orange-400 bg-orange-500/10 border-orange-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-sky-400 bg-sky-500/10 border-sky-500/30';
    }
  };

  const getConfidenceBadgeClass = (conf?: string) => {
    switch (conf?.toUpperCase()) {
      case 'HIGH':
        return 'text-emerald-400 bg-emerald-500/10 border-emerald-500/30';
      case 'MEDIUM':
        return 'text-amber-400 bg-amber-500/10 border-amber-500/30';
      default:
        return 'text-red-400 bg-red-500/10 border-red-500/30';
    }
  };

  const filtered = reports.filter((rep) => {
    const title = getReportTitle(rep);
    const matchesSearch = 
      rep.filename.toLowerCase().includes(searchQuery.toLowerCase()) ||
      title.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSev = severityFilter === 'ALL' || rep.severity?.toUpperCase() === severityFilter;
    return matchesSearch && matchesSev;
  });

  if (loading) {
    return (
      <div className="min-h-[70vh] flex items-center justify-center font-sans text-xs">
        <div className="flex flex-col items-center space-y-3">
          <div className="h-6 w-6 rounded-full border-2 border-cyan-400 border-t-transparent animate-spin" />
          <span className="text-slate-400 font-medium">Loading incident investigation reports...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans max-w-7xl mx-auto">
      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Filters */}
        <div className="bg-[#0e1320] border border-slate-800/80 rounded-xl p-3.5 space-y-3 shadow-md">
          <div className="relative">
            <MagnifyingGlass className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" weight="bold" />
            <input
              type="text"
              placeholder="Search reports by title or file..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#080c14] border border-slate-700/60 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-400 transition-colors"
            />
          </div>

          <div className="flex items-center justify-between gap-2 pt-1 border-t border-slate-800/60">
            <span className="text-[10px] text-slate-400 uppercase font-semibold tracking-wider">Filter:</span>
            <div className="flex gap-1">
              {['ALL', 'CRITICAL', 'HIGH', 'MEDIUM', 'LOW'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`text-[10px] px-2 py-0.5 rounded-md font-medium transition-colors cursor-pointer ${
                    severityFilter === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/40'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/[0.04]'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* List of Reports */}
        <div className="space-y-2 max-h-[620px] overflow-y-auto scrollbar-thin pr-0.5">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500 bg-[#0e1320]/40 border border-slate-800/50 rounded-xl">
              No incident investigations match criteria.
            </div>
          ) : (
            filtered.map((rep) => {
              const isSelected = selectedReport?.id === rep.id;
              return (
                <button
                  key={rep.id}
                  onClick={() => setSelectedReport(rep)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-cyan-950/30 border-cyan-500/50 shadow-[0_0_16px_rgba(6,182,212,0.12)]'
                      : 'bg-[#0d121c] border-slate-800/80 hover:border-slate-700 hover:bg-[#111724]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-0 bottom-0 w-[3px] bg-cyan-400 shadow-[0_0_8px_rgba(6,182,212,0.8)]" />
                  )}
                  <div className="flex items-start justify-between gap-2">
                    <h4 className="text-xs font-semibold text-slate-100 leading-snug truncate">{getReportTitle(rep)}</h4>
                    <span className={`px-2 py-0.5 rounded text-[9px] font-bold tracking-wide shrink-0 border ${getSeverityBadgeClass(rep.severity)}`}>
                      {rep.severity}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 mt-1.5 truncate">
                    File: <span className="font-mono text-[10px] text-cyan-400/90">{rep.filename}</span>
                  </div>
                  <div className="flex items-center justify-between text-[10px] text-slate-500 mt-3 pt-2 border-t border-white/[0.04]">
                    <span className="flex items-center gap-1">
                      <CalendarBlank className="h-3 w-3 text-slate-500" weight="duotone" />
                      {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                    </span>
                    <span className="font-mono tabular-nums text-slate-400">{rep.totalLogs} events</span>
                  </div>
                </button>
              );
            })
          )}
        </div>
      </div>

      {/* Details Area */}
      <div className="lg:col-span-2">
        {selectedReport ? (
          <GlowCard
            glowColor="rgba(6,182,212,0.25)"
            glowOpacity={0.5}
            className="p-6 space-y-6 shadow-2xl bg-[#0b0f19]"
          >
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-slate-800 pb-5 gap-4">
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-slate-300 font-semibold uppercase tracking-wider bg-slate-800/80 border border-slate-700/60 px-2.5 py-0.5 rounded-full flex items-center gap-1.5">
                    <Sparkle className="h-3 w-3 text-indigo-400" weight="fill" /> AI Incident RCA
                  </span>
                  <span className="text-[11px] font-mono text-slate-500">#{selectedReport.id}</span>
                </div>
                <h3 className="text-lg font-bold text-white leading-tight">{getReportTitle(selectedReport)}</h3>
                <div className="flex flex-wrap items-center text-[11px] text-slate-400 gap-x-3 gap-y-1">
                  <span>Source: <strong className="font-mono text-slate-300 font-semibold">{selectedReport.filename}</strong></span>
                  <span>•</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2 shrink-0">
                <button
                  onClick={() => handleDownloadPdf(selectedReport)}
                  className="bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 text-xs font-bold px-3.5 py-2 rounded-lg transition-all shadow-[0_0_12px_rgba(6,182,212,0.25)] hover:shadow-[0_0_20px_rgba(6,182,212,0.4)] cursor-pointer flex items-center gap-1.5"
                >
                  <DownloadSimple className="h-4 w-4" weight="bold" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleDelete(selectedReport.id)}
                  className="border border-red-900/40 hover:bg-red-950/30 text-red-400 text-xs font-medium px-3 py-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <Trash className="h-4 w-4" weight="bold" />
                </button>
              </div>
            </div>

            {/* Metrics Header row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 bg-[#080c14] border border-slate-800/80 rounded-xl p-3.5 text-xs">
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Total Events</span>
                <p className="text-slate-100 font-bold text-base font-mono tabular-nums">{selectedReport.totalLogs}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Error Count</span>
                <p className="text-red-400 font-bold text-base font-mono tabular-nums">{selectedReport.errorCount}</p>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Severity Class</span>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(selectedReport.severity)}`}>
                    {selectedReport.severity}
                  </span>
                </div>
              </div>
              <div className="space-y-1">
                <span className="text-slate-500 text-[10px] uppercase tracking-wider font-semibold">Confidence</span>
                <div>
                  <span className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold border ${getConfidenceBadgeClass(selectedReport.confidence)}`}>
                    {selectedReport.confidence}
                  </span>
                </div>
              </div>
            </div>

            {/* Main Sections */}
            <div className="space-y-4">
              {/* Section 1: Root Cause */}
              <div className="space-y-2 bg-[#0d121f] border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 flex items-center gap-2">
                    <WarningOctagon className="h-4 w-4" weight="duotone" />
                    1. Root Cause Analysis
                  </h4>
                  <button
                    onClick={() => handleCopyText(selectedReport.rootCause, 'rootCause')}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'rootCause' ? <Check className="h-3 w-3 text-emerald-400" weight="bold" /> : <Copy className="h-3 w-3" weight="bold" />}
                    {copiedSection === 'rootCause' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedReport.rootCause}
                </p>
              </div>

              {/* Section 2: Impact */}
              <div className="space-y-2 bg-[#0d121f] border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-amber-400 flex items-center gap-2">
                    <Lightning className="h-4 w-4" weight="fill" />
                    2. Blast Radius & Impact
                  </h4>
                  <button
                    onClick={() => handleCopyText(selectedReport.impact, 'impact')}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'impact' ? <Check className="h-3 w-3 text-emerald-400" weight="bold" /> : <Copy className="h-3 w-3" weight="bold" />}
                    {copiedSection === 'impact' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedReport.impact}
                </p>
              </div>

              {/* Section 3: Recommended Fix */}
              <div className="space-y-2 bg-[#0d121f] border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-emerald-400 flex items-center gap-2">
                    <CheckCircle className="h-4 w-4" weight="fill" />
                    3. Recommended Remediation
                  </h4>
                  <button
                    onClick={() => handleCopyText(selectedReport.recommendedFix, 'fix')}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'fix' ? <Check className="h-3 w-3 text-emerald-400" weight="bold" /> : <Copy className="h-3 w-3" weight="bold" />}
                    {copiedSection === 'fix' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedReport.recommendedFix}
                </p>
              </div>

              {/* Section 4: Best Practices */}
              <div className="space-y-2 bg-[#0d121f] border border-slate-800/80 rounded-xl p-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs uppercase font-bold tracking-wider text-sky-400 flex items-center gap-2">
                    <ShieldCheck className="h-4 w-4" weight="duotone" />
                    4. Preventative Architecture
                  </h4>
                  <button
                    onClick={() => handleCopyText(selectedReport.preventionSteps, 'prevention')}
                    className="text-[10px] text-slate-400 hover:text-white flex items-center gap-1 transition-colors cursor-pointer"
                  >
                    {copiedSection === 'prevention' ? <Check className="h-3 w-3 text-emerald-400" weight="bold" /> : <Copy className="h-3 w-3" weight="bold" />}
                    {copiedSection === 'prevention' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <p className="text-xs text-slate-200 leading-relaxed font-sans whitespace-pre-line">
                  {selectedReport.preventionSteps}
                </p>
              </div>
            </div>
          </GlowCard>
        ) : (
          <div className="bg-[#0e1320] border border-slate-800 rounded-xl p-12 text-center flex flex-col items-center justify-center min-h-[440px]">
            <FileText className="h-12 w-12 text-slate-600 mb-3" weight="duotone" />
            <h4 className="text-sm font-bold text-white">No Incident Selected</h4>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              Select an incident investigation from the left sidebar list to inspect the AI root cause, remediation steps, and export metrics.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ReportsPage;
