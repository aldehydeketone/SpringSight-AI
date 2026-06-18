import api from '../lib/api';
import { Report, DashboardSummary } from '../types';

export const ReportsService = {
  async getUserReports(): Promise<Report[]> {
    const response = await api.get<Report[]>('/api/reports');
    return response.data;
  },

  async getDashboardSummary(): Promise<DashboardSummary> {
    const response = await api.get<DashboardSummary>('/api/reports/dashboard');
    return response.data;
  },

  async getReportById(id: number): Promise<Report> {
    const response = await api.get<Report>(`/api/reports/${id}`);
    return response.data;
  },

  async deleteReport(id: number): Promise<void> {
    await api.delete(`/api/reports/${id}`);
  },

  async downloadReportPdf(id: number, filename: string): Promise<void> {
    const response = await api.get(`/api/reports/${id}/pdf`, {
      responseType: 'blob',
    });
    const blob = new Blob([response.data], { type: 'application/pdf' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.download = filename || `analysis-report-${id}.pdf`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  },
};
