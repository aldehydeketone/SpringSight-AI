import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { UploadPanel } from './UploadPage/UploadPanel';
import { AnalysisPanel } from './UploadPage/AnalysisPanel';
import { ConsolePanel } from './UploadPage/ConsolePanel';
import { LogsService } from '../services/logs.service';
import { AiService } from '../services/ai.service';
import { ReportsService } from '../services/reports.service';
import { AiAnalysisRequest, ParseResponse, AnalysisResult } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  // Pipeline states
  const [status, setStatus] = useState<'idle' | 'processing' | 'error' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [uploadPercent, setUploadPercent] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [reportId, setReportId] = useState<number | null>(null);
  
  // Real backend response stores for stats
  const [parseStats, setParseStats] = useState<ParseResponse | null>(null);
  const [analysisStats, setAnalysisStats] = useState<AnalysisResult | null>(null);
  
  // Status message
  const [statusText, setStatusText] = useState('ready to ingest');
  const [activeStep, setActiveStep] = useState(0);

  // Auto-populate from Dashboard drag-and-drop (file passed via Router state)
  useEffect(() => {
    const state = location.state as { droppedFile?: File } | null;
    if (state?.droppedFile instanceof File) {
      handleFileSelect(state.droppedFile);
      // Clear the router state so a back-navigation doesn't re-trigger
      window.history.replaceState({}, '');
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const handleFileSelect = (file: File) => {
    setSelectedFile(file);
    setStatus('idle');
    setErrorMessage(null);
    setParseStats(null);
    setAnalysisStats(null);
    setReportId(null);
    setStatusText(`${file.name} — loaded, ready for diagnostics`);
  };

  const handleRetry = () => {
    setSelectedFile(null);
    setStatus('idle');
    setProgress(0);
    setUploadPercent(0);
    setErrorMessage(null);
    setParseStats(null);
    setAnalysisStats(null);
    setReportId(null);
    setStatusText('ready to ingest');
  };

  const triggerSamplePipeline = async () => {
    setStatus('processing');
    setProgress(0);
    setUploadPercent(0);
    setErrorMessage(null);
    setParseStats(null);
    setAnalysisStats(null);
    setReportId(null);

    try {
      // Step 1: Uploading File (Mock simulated upload progress)
      setActiveStep(0);
      setProgress(20);
      setStatusText('uploading sample file...');
      for (let i = 0; i <= 100; i += 20) {
        setUploadPercent(i);
        await new Promise(r => setTimeout(r, 100));
      }

      // Step 2: Parsing Log
      setActiveStep(1);
      setProgress(40);
      setStatusText('parsing sample log file...');
      await new Promise(r => setTimeout(r, 600));
      const simulatedParse: ParseResponse = {
        success: true,
        fileId: 999,
        totalLines: 194,
        parsedEntries: 194,
        ignoredLines: 0
      };
      setParseStats(simulatedParse);

      // Step 3: Running AI Analysis
      setActiveStep(2);
      setProgress(60);
      setStatusText('running diagnostics and classification...');
      await new Promise(r => setTimeout(r, 600));
      const simulatedAnalysis: AnalysisResult = {
        fileId: 999,
        totalLogs: 194,
        infoCount: 183,
        warnCount: 8,
        errorCount: 3,
        debugCount: 0,
        unknownCount: 0,
        healthStatus: 'WARNING',
        topErrors: [
          { errorClass: 'com.mysql.cj.jdbc.exceptions.CommunicationsException', count: 2, sampleMessage: 'Communications link failure' },
          { errorClass: 'java.net.ConnectException', count: 1, sampleMessage: 'Connection refused' }
        ],
        topWarnings: [],
        recentErrors: [
          { timestamp: '14:22:01', level: 'ERROR', message: 'Connection refused', logger: 'pool.java', thread: 'main' },
          { timestamp: '14:22:04', level: 'WARN', message: 'Communications link failure', logger: 'pool.java', thread: 'main' }
        ],
        summary: 'Database connection failure.'
      };
      setAnalysisStats(simulatedAnalysis);

      // Step 4: Generating Report
      setActiveStep(3);
      setProgress(80);
      setStatusText('submitting to Gemini AI...');
      
      const aiRequest: AiAnalysisRequest = {
        filename: 'sandbox-communication-error.log',
        totalLogs: 194,
        errorCount: 3,
        warnCount: 8,
        infoCount: 183,
        topErrors: [
          'com.mysql.cj.jdbc.exceptions.CommunicationsException',
          'java.net.ConnectException'
        ],
        sampleErrorLogs: [
          'com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure. Connection refused',
          'java.net.ConnectException: Connection refused'
        ]
      };

      await AiService.analyzeRootCause(aiRequest);

      // Fetch user reports to find latest ID
      const userReports = await ReportsService.getUserReports();
      const generatedReport = userReports.find(r => r.filename === 'sandbox-communication-error.log') || userReports[0];
      if (generatedReport) {
        setReportId(generatedReport.id);
      }

      // Step 5: Analysis Complete
      setActiveStep(4);
      setProgress(100);
      setStatus('success');
      setStatusText('sandbox-communication-error.log — ready for analysis');

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(err.response?.data?.message || 'Sandbox pipeline execution failed.');
      setStatusText('Error: Sandbox pipeline execution failed');
    }
  };

  const triggerAnalysisPipeline = async () => {
    if (!selectedFile) return;

    setStatus('processing');
    setProgress(0);
    setUploadPercent(0);
    setErrorMessage(null);
    setParseStats(null);
    setAnalysisStats(null);
    setReportId(null);

    try {
      // 1. Uploading File
      setActiveStep(0);
      setProgress(15);
      setStatusText(`uploading ${selectedFile.name}...`);
      
      const uploadResult = await LogsService.uploadLogFile(selectedFile, (percent) => {
        setUploadPercent(percent);
      });
      const fileId = uploadResult.id;

      // 2. Parsing Log entries
      setActiveStep(1);
      setProgress(40);
      setStatusText(`parsing ${selectedFile.name}...`);
      const parseResult = await LogsService.parseLogFile(fileId);
      setParseStats(parseResult);

      // 3. Running AI Analysis
      setActiveStep(2);
      setProgress(65);
      setStatusText('running diagnostics analysis...');
      const analysisResult = await LogsService.getLogAnalysis(fileId);
      setAnalysisStats(analysisResult);

      // 4. Generating Report
      setActiveStep(3);
      setProgress(85);
      setStatusText('generating diagnostic report via Gemini...');

      const topErrorsStr = analysisResult.topErrors.map(e => e.errorClass);
      const sampleLogsStr = analysisResult.recentErrors.map(e => `${e.timestamp} [${e.level}] ${e.message}`);
      
      const aiRequest: AiAnalysisRequest = {
        filename: selectedFile.name,
        totalLogs: Number(analysisResult.totalLogs),
        errorCount: Number(analysisResult.errorCount),
        warnCount: Number(analysisResult.warnCount),
        infoCount: Number(analysisResult.infoCount),
        topErrors: topErrorsStr,
        sampleErrorLogs: sampleLogsStr,
      };

      // Pass logFileId dynamically to enhance context if available.
      (aiRequest as any).logFileId = fileId;

      await AiService.analyzeRootCause(aiRequest);

      // Fetch user reports to find latest ID
      const userReports = await ReportsService.getUserReports();
      const generatedReport = userReports.find(r => r.filename === selectedFile.name) || userReports[0];
      if (generatedReport) {
        setReportId(generatedReport.id);
      }

      // 5. Analysis Complete
      setActiveStep(4);
      setProgress(100);
      setStatus('success');
      setStatusText(`${selectedFile.name} — ready for analysis`);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 
        'Pipeline failed. Ensure your log format matches standard Spring Boot output and Gemini is configured.'
      );
      setStatusText('Error: Analysis pipeline failed');
    }
  };

  const handleViewReport = () => {
    if (reportId) {
      navigate('/reports', { state: { selectedReportId: reportId } });
    }
  };

  return (
    <div className="max-w-6xl mx-auto py-4 px-3 select-none">
      {/* Root Layout box — scaled up ~10%, animated border glow */}
      <div className="relative bg-[#060913] rounded-[16px] border border-cyan-500/25 overflow-hidden shadow-[0_0_40px_rgba(6,182,212,0.08)] flex flex-col justify-between min-h-[420px] animate-border-glow">
        
        {/* Holographic Cyan ambient background glow */}
        <div 
          className="absolute top-[-80px] left-[25%] w-[500px] h-[200px] pointer-events-none opacity-50 animate-glow z-0" 
          style={{
            backgroundImage: 'radial-gradient(ellipse at 50% 0%, rgba(6,182,212,0.2) 0%, rgba(20,184,166,0.06) 40%, transparent 75%)'
          }}
        />

        {/* Top traffic dots bar */}
        <div className="flex items-center gap-1.5 px-5 py-3 bg-white/[0.015] border-b border-cyan-500/[0.08] relative z-10 select-none">
          <div className="w-2.5 h-2.5 rounded-full bg-[#ff5f57] shadow-[0_0_6px_rgba(255,95,87,0.6)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#febc2e] shadow-[0_0_6px_rgba(254,188,46,0.5)]" />
          <div className="w-2.5 h-2.5 rounded-full bg-[#28c840] shadow-[0_0_6px_rgba(40,200,64,0.5)]" />
          <span className="font-mono text-[10px] text-white/25 ml-2.5 tracking-wide">springsight — log ingestion</span>
        </div>

        {/* Body grid (Split Left/Right layout) */}
        <div className="grid grid-cols-1 md:grid-cols-2 relative z-10 flex-1 items-stretch">
          {/* Left panel: uploader */}
          <UploadPanel
            onFileSelect={handleFileSelect}
            selectedFile={selectedFile}
            status={status}
            uploadPercent={uploadPercent}
            progress={progress}
            errorMessage={errorMessage}
            onRetry={handleRetry}
            onStartSampleAnalysis={triggerSamplePipeline}
            onStartRealAnalysis={triggerAnalysisPipeline}
            parseStats={parseStats}
          />

          {/* Right panel: stream analysis */}
          <AnalysisPanel
            status={status}
            activeStep={activeStep}
            selectedFile={selectedFile}
            parseStats={parseStats}
            analysisStats={analysisStats}
            reportId={reportId}
            onViewReport={handleViewReport}
          />
        </div>

        {/* Bottom Status bar Console */}
        <ConsolePanel
          status={status}
          statusText={statusText}
        />
      </div>
    </div>
  );
};

export default UploadPage;
