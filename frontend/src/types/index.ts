export interface User {
  id: number;
  name: string;
  email: string;
  createdAt: string;
}

export interface DashboardSummary {
  totalReports: number;
  criticalReports: number;
  highReports: number;
  mediumReports: number;
  lowReports: number;
  totalErrorsAnalyzed: number;
}

export interface UploadResponse {
  id: number;
  fileName: string;
  fileSize: number;
  fileType: string;
}

export interface ParseResponse {
  success: boolean;
  fileId: number;
  totalLines: number;
  parsedEntries: number;
  ignoredLines: number;
}

export interface ErrorSummary {
  errorClass: string;
  count: number;
  sampleMessage: string;
}

export interface WarningSummary {
  warningClass: string;
  count: number;
  sampleMessage: string;
}

export interface RecentError {
  timestamp: string;
  level: string;
  message: string;
  logger: string;
  thread: string;
}

export interface AnalysisResult {
  fileId: number;
  totalLogs: number;
  infoCount: number;
  warnCount: number;
  errorCount: number;
  debugCount: number;
  unknownCount: number;
  healthStatus: string;
  topErrors: ErrorSummary[];
  topWarnings: WarningSummary[];
  recentErrors: RecentError[];
  summary: string;
}

export interface RootCauseResponse {
  rootCause: string;
  severity: string;
  impact: string;
  recommendedFix: string;
  preventionSteps: string;
  confidence: string;
}

export interface Report {
  id: number;
  filename: string;
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  rootCause: string;
  severity: string;
  impact: string;
  recommendedFix: string;
  preventionSteps: string;
  confidence: string;
  createdAt: string;
}

export interface ActivityEvent {
  id: string;
  timestamp: string;
  type: 'UPLOAD' | 'PARSE' | 'ANALYZE' | 'AI_COMPLETE' | 'PDF_EXPORT' | 'DELETE';
  message: string;
  severity?: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
}

export interface ChartDataPoint {
  date: string;
  reports: number;
  errors: number;
}

// Request Types
export interface LoginRequest {
  email: string;
  password?: string;
}

export interface RegisterRequest {
  name: string;
  email: string;
  password?: string;
}

export interface ForgotPasswordRequest {
  email: string;
}

export interface ResetPasswordRequest {
  token: string;
  newPassword: string;
}

export interface AiAnalysisRequest {
  filename: string;
  totalLogs: number;
  errorCount: number;
  warnCount: number;
  infoCount: number;
  topErrors: string[];
  sampleErrorLogs: string[];
}

// Response Envelopes
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface AuthResponse {
  token: string;
  user: User;
}
