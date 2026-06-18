import React, { useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { UploadAnimation } from '../components/ui/upload-animation';
import { ShineBorder } from '../components/ui/shine-border';
import { ShimmerButton } from '../components/ui/shimmer-button';
import { ShimmeringText } from '../components/ui/shimmering-text';
import { LogsService } from '../services/logs.service';
import { AiService } from '../services/ai.service';
import { Upload, AlertCircle, FileText, CheckCircle2, ShieldCheck, Terminal } from 'lucide-react';
import { AiAnalysisRequest } from '../types';

export const UploadPage: React.FC = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isSandbox, setIsSandbox] = useState(false);
  
  // Pipeline states
  const [status, setStatus] = useState<'idle' | 'processing' | 'error' | 'success'>('idle');
  const [progress, setProgress] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  // Pipeline steps
  const [activeStep, setActiveStep] = useState(0);
  const steps = [
    'Uploading File',
    'Parsing Log Entries',
    'Extracting Exceptions',
    'Analyzing Root Cause',
    'Generating Recommendations',
    'Creating Report',
    'Analysis Complete',
  ];

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      const file = e.dataTransfer.files[0];
      if (file.name.endsWith('.log') || file.name.endsWith('.txt')) {
        setSelectedFile(file);
      } else {
        setErrorMessage('Invalid file type. Only .log and .txt files are supported.');
        setStatus('error');
      }
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setStatus('idle');
      setErrorMessage(null);
    }
  };

  const triggerSamplePipeline = async () => {
    setIsSandbox(true);
    setStatus('processing');
    setProgress(0);
    setErrorMessage(null);

    try {
      // Step 1: Uploading File (Simulated delay)
      setActiveStep(0);
      setProgress(15);
      await new Promise(r => setTimeout(r, 600));

      // Step 2: Parsing Log Entries
      setActiveStep(1);
      setProgress(30);
      await new Promise(r => setTimeout(r, 600));

      // Step 3: Extracting Exceptions
      setActiveStep(2);
      setProgress(45);
      await new Promise(r => setTimeout(r, 600));

      // Step 4: Analyzing Root Cause
      setActiveStep(3);
      setProgress(60);
      await new Promise(r => setTimeout(r, 600));

      // Step 5: Generating Recommendations
      setActiveStep(4);
      setProgress(75);
      await new Promise(r => setTimeout(r, 600));

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
          'com.mysql.cj.jdbc.exceptions.CommunicationsException: Communications link failure. Connection refused (Connection refused)',
          'java.net.ConnectException: Connection refused (Connection refused)'
        ]
      };

      // Step 6: Creating Report
      setActiveStep(5);
      setProgress(90);
      await AiService.analyzeRootCause(aiRequest);

      // Step 7: Analysis Complete
      setActiveStep(6);
      setProgress(100);
      setStatus('success');

      setTimeout(() => {
        navigate('/reports');
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 
        'Sandbox pipeline execution failed.'
      );
    }
  };

  const triggerAnalysisPipeline = async () => {
    if (!selectedFile) return;

    setIsSandbox(false);
    setStatus('processing');
    setProgress(0);
    setErrorMessage(null);

    try {
      // 1. Uploading File
      setActiveStep(0);
      setProgress(15);
      const uploadResult = await LogsService.uploadLogFile(selectedFile);
      const fileId = uploadResult.id;

      // 2. Parsing Log Entries
      setActiveStep(1);
      setProgress(30);
      await LogsService.parseLogFile(fileId);

      // 3. Extracting Exceptions
      setActiveStep(2);
      setProgress(45);
      const analysisResult = await LogsService.getLogAnalysis(fileId);

      // 4. Analyzing Root Cause & 5. Generating Recommendations
      setActiveStep(3);
      setProgress(60);
      
      await new Promise(r => setTimeout(r, 800));
      setActiveStep(4);
      setProgress(75);

      // Prepare request payload for Gemini
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

      // 6. Creating Report
      setActiveStep(5);
      setProgress(90);
      await AiService.analyzeRootCause(aiRequest);

      // 7. Analysis Complete
      setActiveStep(6);
      setProgress(100);
      setStatus('success');

      setTimeout(() => {
        navigate('/reports');
      }, 1000);

    } catch (err: any) {
      console.error(err);
      setStatus('error');
      setErrorMessage(
        err.response?.data?.message || 
        'Pipeline failed. Ensure your log format matches standard Spring Boot output and Gemini is configured.'
      );
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 py-8 font-sans">
      {/* Hero Header */}
      <div className="text-center space-y-2">
        <span className="text-[10px] uppercase font-bold tracking-widest text-cyan-400 bg-cyan-950/60 border border-cyan-800/40 px-3 py-1 rounded-full">
          AI incident investigator
        </span>
        <h2 className="text-2xl md:text-3xl font-extrabold text-white tracking-tight animate-fade-in">
          AI Powered Log Analysis
        </h2>
        <p className="text-xs text-[#94a3b8] max-w-lg mx-auto">
          Upload Spring Boot application logs and receive instant structured AI-powered root cause analysis reports.
        </p>
      </div>

      {/* Main Upload Zone */}
      <div className="flex flex-col items-center justify-center">
        <ShineBorder borderWidth={2} borderRadius={16} className="w-full max-w-xl">
          <div
            onDragOver={handleDragOver}
            onDrop={handleDrop}
            className="p-8 flex flex-col items-center justify-center border border-dashed border-[#1e293b]/60 rounded-2xl bg-[#12121a]/90 min-h-[350px] relative transition-all duration-300"
          >
            {status === 'idle' && (
              <div className="flex flex-col items-center space-y-6 text-center w-full">
                {/* Upload Float Animation component */}
                <UploadAnimation />

                <div className="space-y-1">
                  <p className="text-xs text-[#f1f5f9] font-bold">
                    {selectedFile ? selectedFile.name : 'Drag & Drop log files here'}
                  </p>
                  <p className="text-[10px] text-[#94a3b8]/70">
                    Supports .log and .txt files up to 10MB
                  </p>
                </div>

                <div className="flex flex-col items-center space-y-3 w-full">
                  <input
                    ref={fileInputRef}
                    type="file"
                    accept=".log,.txt"
                    onChange={handleFileChange}
                    className="hidden"
                  />
                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="border border-[#1e293b] hover:border-blue-500/50 bg-[#161622] text-[#f1f5f9] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                  >
                    Choose Log File
                  </button>

                  {selectedFile && (
                    <ShimmerButton onClick={triggerAnalysisPipeline} className="mt-2 text-xs">
                      Analyze Logs
                    </ShimmerButton>
                  )}

                  {/* Recruiter Sandbox entry */}
                  <div className="text-[10px] text-[#94a3b8]/60 mt-3 pt-3 border-t border-[#1e293b]/60 w-full flex items-center justify-center gap-1.5">
                    <span>No log files on your machine?</span>
                    <button
                      onClick={triggerSamplePipeline}
                      className="text-cyan-400 font-bold hover:underline cursor-pointer flex items-center gap-1"
                    >
                      <Terminal className="h-3 w-3" />
                      Run Sample Analysis
                    </button>
                  </div>
                </div>
              </div>
            )}

            {status === 'processing' && (
              <div className="w-full flex flex-col items-center space-y-6 py-6">
                <UploadAnimation isUploading progress={progress} />

                {/* Pipeline Step Loader */}
                <div className="text-center space-y-1">
                  <h4 className="text-xs font-bold text-white">
                    <ShimmeringText text={steps[activeStep]} />
                  </h4>
                  <p className="text-[10px] text-[#94a3b8]/70">
                    {isSandbox ? 'Sandbox simulation pipeline' : `Executing pipeline stage ${activeStep + 1} of ${steps.length}`}
                  </p>
                </div>

                {/* Progress bar */}
                <div className="w-full max-w-xs bg-[#0a0a0f] h-1.5 rounded-full overflow-hidden border border-[#1e293b]/45">
                  <div
                    className="bg-gradient-to-r from-blue-500 to-cyan-500 h-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>

                {/* Checklist steps */}
                <div className="w-full max-w-xs text-[10px] font-mono space-y-1.5 border-t border-[#1e293b]/50 pt-4">
                  {steps.map((step, idx) => (
                    <div
                      key={idx}
                      className={`flex items-center justify-between ${
                        idx < activeStep
                          ? 'text-cyan-400 font-bold'
                          : idx === activeStep
                          ? 'text-white font-extrabold animate-pulse'
                          : 'text-[#94a3b8]/40'
                      }`}
                    >
                      <span>{step}</span>
                      <span>
                        {idx < activeStep ? '✓' : idx === activeStep ? '●' : '○'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center py-6">
                <div className="h-12 w-12 rounded-full bg-red-950/50 border border-red-800/60 flex items-center justify-center text-red-500">
                  <AlertCircle className="h-6 w-6" />
                </div>
                <div className="space-y-1.5 max-w-sm">
                  <h4 className="text-xs font-bold text-white">Analysis Pipeline Failed</h4>
                  <p className="text-[10px] text-red-400/80 leading-relaxed font-mono">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => setStatus('idle')}
                  className="border border-[#1e293b] bg-[#161622] hover:bg-[#1a1a2e] text-[#f1f5f9] text-xs font-semibold px-4 py-2 rounded-lg cursor-pointer transition-colors"
                >
                  Retry Upload
                </button>
              </div>
            )}

            {status === 'success' && (
              <div className="flex flex-col items-center justify-center space-y-4 text-center py-6 animate-in fade-in duration-300">
                <div className="h-12 w-12 rounded-full bg-green-950/50 border border-green-800/60 flex items-center justify-center text-green-500">
                  <ShieldCheck className="h-6 w-6" />
                </div>
                <div className="space-y-1">
                  <h4 className="text-xs font-bold text-white">Pipeline Execution Completed</h4>
                  <p className="text-[10px] text-green-400 font-semibold animate-pulse">
                    Redirecting to Incident Investigation history...
                  </p>
                </div>
              </div>
            )}
          </div>
        </ShineBorder>
      </div>

      {/* Workflow Information Footer */}
      <div className="max-w-xl mx-auto border border-[#1e293b]/60 rounded-xl p-4 bg-[#12121a]/60 text-xs flex items-start space-x-3 text-[#94a3b8]/80 leading-relaxed">
        <CheckCircle2 className="h-5 w-5 text-cyan-500 shrink-0 mt-0.5" />
        <p>
          <strong>Automatic Pipeline Actions:</strong> The file is processed locally and matches parsed logs into stack trace records. Only the incident statistics summaries are securely uploaded to Gemini AI for root cause investigation.
        </p>
      </div>
    </div>
  );
};
export default UploadPage;
