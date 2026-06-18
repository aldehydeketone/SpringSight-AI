import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { ReportsService } from '../services/reports.service';
import { Report } from '../types';
import {
  Search,
  Calendar,
  AlertOctagon,
  Download,
  Trash2,
  ShieldCheck,
  CheckCircle,
  Eye,
  FileText
} from 'lucide-react';

export const ReportsPage: React.FC = () => {
  const location = useLocation();
  const [reports, setReports] = useState<Report[]>([]);
  const [selectedReport, setSelectedReport] = useState<Report | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState('ALL');
  const [loading, setLoading] = useState(true);

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

      // Handle deep-linked selected report from dashboard
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
    if (window.confirm('Delete this report?')) {
      try {
        await ReportsService.deleteReport(id);
        setReports((prev) => prev.filter((r) => r.id !== id));
        if (selectedReport?.id === id) {
          setSelectedReport(null);
        }
      } catch (err) {
        alert('Failed to delete.');
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

  const getSeverityBadgeClass = (sev?: string) => {
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

  const getConfidenceBadgeClass = (conf?: string) => {
    switch (conf?.toUpperCase()) {
      case 'HIGH':
        return 'text-green-400 bg-green-950/40 border-green-800/40';
      case 'MEDIUM':
        return 'text-yellow-400 bg-yellow-950/40 border-yellow-800/40';
      default:
        return 'text-red-400 bg-red-950/40 border-red-800/40';
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
      <div className="min-h-[70vh] flex items-center justify-center font-mono text-xs">
        <div className="flex flex-col items-center space-y-2">
          <div className="h-4 w-4 rounded-full border-2 border-cyan-500 border-t-transparent animate-spin" />
          <span className="text-[#94a3b8]">Loading incidents database...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans max-w-7xl mx-auto">
      {/* Sidebar List */}
      <div className="lg:col-span-1 space-y-4">
        {/* Filters */}
        <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-4 space-y-3">
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-[#94a3b8]/50" />
            <input
              type="text"
              placeholder="Search reports or classes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#0a0a0f] border border-[#1e293b] rounded-lg pl-9 pr-4 py-2 text-xs text-[#f1f5f9] placeholder-[#94a3b8]/40 focus:outline-none focus:border-cyan-500"
            />
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-[#94a3b8] uppercase font-bold tracking-wider">Severity:</span>
            <select
              value={severityFilter}
              onChange={(e) => setSeverityFilter(e.target.value)}
              className="bg-[#0a0a0f] border border-[#1e293b] rounded text-[10px] text-[#f1f5f9] px-2 py-1 focus:outline-none"
            >
              <option value="ALL">ALL</option>
              <option value="CRITICAL">CRITICAL</option>
              <option value="HIGH">HIGH</option>
              <option value="MEDIUM">MEDIUM</option>
              <option value="LOW">LOW</option>
            </select>
          </div>
        </div>

        {/* List of Reports */}
        <div className="space-y-2.5 max-h-[600px] overflow-y-auto scrollbar-thin">
          {filtered.length === 0 ? (
            <div className="text-center py-10 text-xs text-[#94a3b8] italic bg-[#12121a]/30 border border-[#1e293b]/40 rounded-xl">
              No incident investigations match filters.
            </div>
          ) : (
            filtered.map((rep) => (
              <button
                key={rep.id}
                onClick={() => setSelectedReport(rep)}
                className={`w-full text-left p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                  selectedReport?.id === rep.id
                    ? 'bg-blue-600/15 border-blue-500/50 shadow-md shadow-blue-500/5'
                    : 'bg-[#12121a] border-[#1e293b] hover:border-blue-500/30'
                }`}
              >
                <div className="flex items-start justify-between space-x-2">
                  <h4 className="text-xs font-bold text-white leading-snug">{getReportTitle(rep)}</h4>
                  <span className={`px-1.5 py-0.5 rounded border text-[8px] font-extrabold font-mono tracking-wider shrink-0 ${getSeverityBadgeClass(rep.severity)}`}>
                    {rep.severity}
                  </span>
                </div>
                <div className="flex items-center space-x-2 text-[9px] text-[#94a3b8]/60 mt-2 font-mono">
                  <span>File: {rep.filename}</span>
                </div>
                <div className="flex items-center justify-between text-[9px] text-[#94a3b8]/60 mt-3 pt-2.5 border-t border-[#1e293b]/30">
                  <span className="flex items-center gap-1 font-mono">
                    <Calendar className="h-3 w-3" />
                    {new Date(rep.createdAt).toLocaleDateString([], { month: 'short', day: 'numeric' })}
                  </span>
                  <span className="font-mono">{rep.totalLogs} entries</span>
                </div>
              </button>
            ))
          )}
        </div>
      </div>

      {/* Details Area */}
      <div className="lg:col-span-2">
        {selectedReport ? (
          <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-6 shadow-xl space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between border-b border-[#1e293b] pb-4 gap-4">
              <div className="space-y-1.5">
                <span className="text-[9px] font-mono text-cyan-400 font-bold tracking-widest uppercase">AI Incident Investigation</span>
                <h3 className="text-base font-extrabold text-white leading-tight">{getReportTitle(selectedReport)}</h3>
                <div className="flex flex-col md:flex-row md:items-start text-[10px] text-[#94a3b8] font-mono gap-1 md:gap-3">
                  <span>Log File Source: {selectedReport.filename}</span>
                  <span className="hidden md:inline">•</span>
                  <span>Incident ID: #{selectedReport.id}</span>
                  <span className="hidden md:inline">•</span>
                  <span>{new Date(selectedReport.createdAt).toLocaleString()}</span>
                </div>
              </div>

              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleDownloadPdf(selectedReport)}
                  className="bg-gradient-to-r from-blue-600 to-cyan-600 hover:from-blue-500 hover:to-cyan-500 text-white text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Download className="h-3.5 w-3.5" />
                  Export PDF
                </button>
                <button
                  onClick={() => handleDelete(selectedReport.id)}
                  className="border border-[#1e293b] hover:bg-red-950/20 text-red-400 hover:border-red-900/40 text-[11px] font-bold px-3 py-1.5 rounded-lg transition-colors cursor-pointer flex items-center gap-1"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                  Delete
                </button>
              </div>
            </div>

            {/* Metrics Header row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 bg-[#0a0a0f] border border-[#1e293b]/60 rounded-xl p-4 font-mono text-xs">
              <div className="space-y-1">
                <span className="text-[#94a3b8] text-[10px]">Total Log Lines</span>
                <p className="text-[#f1f5f9] font-bold text-sm">{selectedReport.totalLogs}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#94a3b8] text-[10px]">Errors Count</span>
                <p className="text-red-400 font-bold text-sm">{selectedReport.errorCount}</p>
              </div>
              <div className="space-y-1">
                <span className="text-[#94a3b8] text-[10px]">Severity Class</span>
                <span className={`mt-0.5 inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold ${getSeverityBadgeClass(selectedReport.severity)}`}>
                  {selectedReport.severity}
                </span>
              </div>
              <div className="space-y-1">
                <span className="text-[#94a3b8] text-[10px]">AI Confidence</span>
                <span className={`mt-0.5 inline-block px-2 py-0.5 rounded border text-[10px] font-extrabold ${getConfidenceBadgeClass(selectedReport.confidence)}`}>
                  {selectedReport.confidence}
                </span>
              </div>
            </div>

            {/* Main Sections */}
            <div className="space-y-5">
              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4" />
                  1. Root Cause Summary
                </h4>
                <p className="text-xs text-[#94a3b8] bg-[#1a1a2e]/40 border border-[#1e293b]/60 rounded-lg p-3.5 leading-relaxed font-mono whitespace-pre-line">
                  {selectedReport.rootCause}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                  <AlertOctagon className="h-4 w-4" />
                  2. Impact Severity & Vector
                </h4>
                <p className="text-xs text-[#94a3b8] bg-[#1a1a2e]/40 border border-[#1e293b]/60 rounded-lg p-3.5 leading-relaxed font-mono whitespace-pre-line">
                  {selectedReport.impact}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                  <CheckCircle className="h-4 w-4" />
                  3. Recommended Mitigation Fix
                </h4>
                <p className="text-xs text-[#94a3b8] bg-[#1a1a2e]/40 border border-[#1e293b]/60 rounded-lg p-3.5 leading-relaxed font-mono whitespace-pre-line">
                  {selectedReport.recommendedFix}
                </p>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs uppercase font-bold tracking-wider text-cyan-400 font-mono flex items-center gap-1.5">
                  <ShieldCheck className="h-4 w-4" />
                  4. Preventative Best Practices
                </h4>
                <p className="text-xs text-[#94a3b8] bg-[#1a1a2e]/40 border border-[#1e293b]/60 rounded-lg p-3.5 leading-relaxed font-mono whitespace-pre-line">
                  {selectedReport.preventionSteps}
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="bg-[#12121a] border border-[#1e293b] rounded-xl p-8 text-center flex flex-col items-center justify-center min-h-[400px]">
            <FileText className="h-10 w-10 text-[#94a3b8]/40 mb-3" />
            <h4 className="text-xs font-bold text-white">No Incident Selected</h4>
            <p className="text-[10px] text-[#94a3b8] mt-1 max-w-xs">
              Select an AI incident investigation report from the sidebar list to inspect the diagnostics summary.
            </p>
          </div>
        )}
      </div>
    </div>
  );
};
export default ReportsPage;
