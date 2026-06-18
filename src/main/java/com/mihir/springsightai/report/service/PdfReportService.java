package com.mihir.springsightai.report.service;

/**
 * Service interface for dynamic PDF generation from Analysis Reports.
 */
public interface PdfReportService {

    /**
     * Generates a styled, professional enterprise PDF report for a given analysis report.
     * Validates owner ownership of the report.
     *
     * @param reportId The database ID of the analysis report to export
     * @return Byte array of the generated PDF
     */
    byte[] generateReportPdf(Long reportId);
}
