import api from '../lib/api';
import { UploadResponse, ParseResponse, AnalysisResult, ApiResponse } from '../types';

export const LogsService = {
  async uploadLogFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<ApiResponse<UploadResponse>>('/api/logs/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.data;
  },

  async parseLogFile(id: number): Promise<ParseResponse> {
    const response = await api.post<ParseResponse>(`/api/logs/${id}/parse`);
    return response.data;
  },

  async getLogAnalysis(id: number): Promise<AnalysisResult> {
    const response = await api.get<AnalysisResult>(`/api/logs/${id}/analysis`);
    return response.data;
  },
};
