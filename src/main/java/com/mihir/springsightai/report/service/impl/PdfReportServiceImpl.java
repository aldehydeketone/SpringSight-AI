package com.mihir.springsightai.report.service.impl;

import com.lowagie.text.Document;
import com.lowagie.text.DocumentException;
import com.lowagie.text.Element;
import com.lowagie.text.Font;
import com.lowagie.text.FontFactory;
import com.lowagie.text.PageSize;
import com.lowagie.text.Paragraph;
import com.lowagie.text.Phrase;
import com.lowagie.text.Rectangle;
import com.lowagie.text.pdf.BaseFont;
import com.lowagie.text.pdf.PdfContentByte;
import com.lowagie.text.pdf.PdfPCell;
import com.lowagie.text.pdf.PdfPRow;
import com.lowagie.text.pdf.PdfPTable;
import com.lowagie.text.pdf.PdfPageEventHelper;
import com.lowagie.text.pdf.PdfWriter;
import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.exception.PdfGenerationException;
import com.mihir.springsightai.exception.ReportNotFoundException;
import com.mihir.springsightai.exception.UnauthorizedReportAccessException;
import com.mihir.springsightai.report.entity.AnalysisReport;
import com.mihir.springsightai.report.repository.AnalysisReportRepository;
import com.mihir.springsightai.report.service.PdfReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.ByteArrayOutputStream;
import java.time.format.DateTimeFormatter;

@Service
@RequiredArgsConstructor
@Slf4j
public class PdfReportServiceImpl implements PdfReportService {

    private final AnalysisReportRepository analysisReportRepository;
    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    @Override
    @Transactional(readOnly = true)
    public byte[] generateReportPdf(Long reportId) {
        log.info("[PdfReportService] Generating PDF for report ID: {}", reportId);

        // 1. Fetch report and validate ownership
        AnalysisReport report = getOwnedReport(reportId);

        // 2. Generate PDF in memory
        try (ByteArrayOutputStream out = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 54, 54, 54, 54);
            PdfWriter writer = PdfWriter.getInstance(document, out);

            // Register footer page event helper
            writer.setPageEvent(new PdfReportFooterEvent());

            document.open();

            // Add Header Banner
            addHeader(document);

            // Add Metadata Table
            addMetadataTable(document, report);

            // Add Root Cause Section
            addSectionHeader(document, "1. Executive Summary & Root Cause");
            addBodyText(document, report.getRootCause());

            // Add Impact Section
            addSectionHeader(document, "2. Incident Impact Analysis");
            addBodyText(document, report.getImpact());

            // Add Recommended Fix Section
            addSectionHeader(document, "3. Recommended Action Plan (Fix)");
            addBodyText(document, report.getRecommendedFix());

            // Add Prevention Section
            addSectionHeader(document, "4. Prevention Strategy & System Hardening");
            addBodyText(document, report.getPreventionSteps());

            document.close();
            log.info("[PdfReportService] PDF generated successfully for report ID: {}", reportId);
            return out.toByteArray();

        } catch (Exception e) {
            log.error("[PdfReportService] Failed to generate PDF for report ID: {}", reportId, e);
            throw new PdfGenerationException(reportId, e);
        }
    }

    private void addHeader(Document document) throws DocumentException {
        // App / Brand Label
        Font brandFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 10, new java.awt.Color(79, 70, 229)); // Indigo
        Paragraph brand = new Paragraph("SPRINGSIGHT AI", brandFont);
        brand.setAlignment(Element.ALIGN_CENTER);
        document.add(brand);

        // Document Main Title
        Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 20, new java.awt.Color(30, 41, 59)); // Slate-800
        Paragraph title = new Paragraph("Incident Diagnosis & Analysis Report", titleFont);
        title.setAlignment(Element.ALIGN_CENTER);
        title.setSpacingBefore(4f);
        title.setSpacingAfter(15f);
        document.add(title);

        addDivider(document);
    }

    private void addMetadataTable(Document document, AnalysisReport report) throws DocumentException {
        PdfPTable table = new PdfPTable(4);
        table.setWidthPercentage(100);
        table.setSpacingBefore(10f);
        table.setSpacingAfter(15f);

        // Column widths ratio: 20% | 30% | 20% | 30%
        table.setWidths(new float[]{2f, 3f, 2f, 3f});

        java.awt.Color labelColor = new java.awt.Color(100, 116, 139); // Slate-500
        java.awt.Color valColor = new java.awt.Color(30, 41, 59); // Slate-800
        java.awt.Color cellBg = new java.awt.Color(248, 250, 252); // Slate-50
        java.awt.Color borderColor = new java.awt.Color(226, 232, 240); // Slate-200

        Font labelFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9, labelColor);
        Font valFont = FontFactory.getFont(FontFactory.HELVETICA, 9, valColor);

        // Row 1: Report ID & Filename
        addMetadataCell(table, "Report ID:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, "#" + report.getId(), valFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, "Log File:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, report.getFilename(), valFont, cellBg, borderColor, Element.ALIGN_LEFT);

        // Row 2: Generated At & Total Logs
        addMetadataCell(table, "Generated At:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, report.getCreatedAt().format(DATE_FORMATTER), valFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, "Total Logs:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        addMetadataCell(table, String.format("%,d lines", report.getTotalLogs()), valFont, cellBg, borderColor, Element.ALIGN_LEFT);

        // Row 3: Severity & Confidence
        addMetadataCell(table, "Severity:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        table.addCell(createSeverityBadgeCell(report.getSeverity(), cellBg, borderColor));
        addMetadataCell(table, "Confidence:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        table.addCell(createConfidenceBadgeCell(report.getConfidence(), cellBg, borderColor));

        // Row 4: Metrics (span 3 columns for val)
        addMetadataCell(table, "Log Metrics:", labelFont, cellBg, borderColor, Element.ALIGN_LEFT);
        String metricsText = String.format("%d Errors  /  %d Warnings  /  %d Info logs",
                report.getErrorCount(), report.getWarnCount(), report.getInfoCount());
        PdfPCell metricsCell = new PdfPCell(new Phrase(metricsText, valFont));
        metricsCell.setColspan(3);
        metricsCell.setBackgroundColor(cellBg);
        metricsCell.setBorderColor(borderColor);
        metricsCell.setPadding(6f);
        metricsCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(metricsCell);

        document.add(table);
        addDivider(document);
    }

    private void addMetadataCell(PdfPTable table, String text, Font font, java.awt.Color bg, java.awt.Color border, int align) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(bg);
        cell.setBorderColor(border);
        cell.setPadding(6f);
        cell.setHorizontalAlignment(align);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        table.addCell(cell);
    }

    private PdfPCell createSeverityBadgeCell(String severity, java.awt.Color bg, java.awt.Color border) {
        java.awt.Color badgeBg;
        java.awt.Color badgeText = java.awt.Color.WHITE;

        switch (severity != null ? severity.toUpperCase() : "UNKNOWN") {
            case "CRITICAL":
                badgeBg = new java.awt.Color(239, 68, 68); // Red
                break;
            case "HIGH":
                badgeBg = new java.awt.Color(249, 115, 22); // Orange
                break;
            case "MEDIUM":
                badgeBg = new java.awt.Color(234, 179, 8); // Yellow
                badgeText = new java.awt.Color(15, 23, 42); // Slate-900 for readability on yellow
                break;
            case "LOW":
                badgeBg = new java.awt.Color(34, 197, 94); // Green
                break;
            default:
                badgeBg = new java.awt.Color(100, 116, 139); // Slate-500
                break;
        }

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setBorderColor(border);
        cell.setPadding(6f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPTable badgeTable = new PdfPTable(1);
        badgeTable.setWidthPercentage(100);
        Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, badgeText);
        PdfPCell badgeCell = new PdfPCell(new Phrase(severity, badgeFont));
        badgeCell.setBackgroundColor(badgeBg);
        badgeCell.setBorder(Rectangle.NO_BORDER);
        badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        badgeCell.setPaddingTop(1f);
        badgeCell.setPaddingBottom(2f);
        badgeCell.setPaddingLeft(4f);
        badgeCell.setPaddingRight(4f);

        badgeTable.addCell(badgeCell);
        cell.addElement(badgeTable);

        return cell;
    }

    private PdfPCell createConfidenceBadgeCell(String confidence, java.awt.Color bg, java.awt.Color border) {
        java.awt.Color badgeBg;
        switch (confidence != null ? confidence.toUpperCase() : "UNKNOWN") {
            case "HIGH":
                badgeBg = new java.awt.Color(59, 130, 246); // Blue
                break;
            case "MEDIUM":
                badgeBg = new java.awt.Color(14, 165, 233); // Sky
                break;
            default:
                badgeBg = new java.awt.Color(100, 116, 139); // Slate-500
                break;
        }

        PdfPCell cell = new PdfPCell();
        cell.setBackgroundColor(bg);
        cell.setBorderColor(border);
        cell.setPadding(6f);
        cell.setVerticalAlignment(Element.ALIGN_MIDDLE);

        PdfPTable badgeTable = new PdfPTable(1);
        badgeTable.setWidthPercentage(100);
        Font badgeFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 7.5f, java.awt.Color.WHITE);
        PdfPCell badgeCell = new PdfPCell(new Phrase(confidence, badgeFont));
        badgeCell.setBackgroundColor(badgeBg);
        badgeCell.setBorder(Rectangle.NO_BORDER);
        badgeCell.setHorizontalAlignment(Element.ALIGN_CENTER);
        badgeCell.setVerticalAlignment(Element.ALIGN_MIDDLE);
        badgeCell.setPaddingTop(1f);
        badgeCell.setPaddingBottom(2f);
        badgeCell.setPaddingLeft(4f);
        badgeCell.setPaddingRight(4f);

        badgeTable.addCell(badgeCell);
        cell.addElement(badgeTable);

        return cell;
    }

    private void addDivider(Document document) throws DocumentException {
        PdfPTable table = new PdfPTable(1);
        table.setWidthPercentage(100);
        table.setSpacingBefore(5f);
        table.setSpacingAfter(12f);

        PdfPCell cell = new PdfPCell();
        cell.setBorder(Rectangle.BOTTOM);
        cell.setBorderWidth(1f);
        cell.setBorderColor(new java.awt.Color(226, 232, 240)); // Slate-200
        cell.setPadding(0);
        cell.setFixedHeight(1f);

        table.addCell(cell);
        document.add(table);
    }

    private void addSectionHeader(Document document, String title) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12, new java.awt.Color(30, 41, 59)); // Slate-800
        Paragraph header = new Paragraph(title, font);
        header.setSpacingBefore(12f);
        header.setSpacingAfter(6f);
        document.add(header);
    }

    private void addBodyText(Document document, String text) throws DocumentException {
        Font font = FontFactory.getFont(FontFactory.HELVETICA, 10, new java.awt.Color(51, 65, 85)); // Slate-700
        Paragraph p = new Paragraph(text, font);
        p.setLeading(14f); // Professional line leading
        p.setSpacingAfter(14f);
        document.add(p);
    }

    private AnalysisReport getOwnedReport(Long reportId) {
        AnalysisReport report = analysisReportRepository.findById(reportId)
                .orElseThrow(() -> new ReportNotFoundException(reportId));
        Long authenticatedUserId = getAuthenticatedUser().getId();
        if (!report.getUser().getId().equals(authenticatedUserId)) {
            throw new UnauthorizedReportAccessException(reportId);
        }
        return report;
    }

    private User getAuthenticatedUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User user)) {
            throw new IllegalStateException("Authenticated user is unavailable");
        }
        return user;
    }

    /**
     * Inner class helper for drawing headers/footers with dynamic page numbers.
     */
    private static class PdfReportFooterEvent extends PdfPageEventHelper {
        @Override
        public void onEndPage(PdfWriter writer, Document document) {
            PdfContentByte cb = writer.getDirectContent();
            cb.saveState();
            cb.beginText();
            try {
                BaseFont bf = BaseFont.createFont(BaseFont.HELVETICA, BaseFont.CP1252, BaseFont.NOT_EMBEDDED);
                cb.setFontAndSize(bf, 8);
                cb.setColorFill(new java.awt.Color(148, 163, 184)); // Slate-400

                String footerText = "Generated by SpringSight AI";
                String pageText = "Page " + writer.getPageNumber();

                // Draw brand text on the left margin
                cb.showTextAligned(PdfContentByte.ALIGN_LEFT, footerText, document.left(), document.bottom() - 18, 0);
                // Draw page number on the right margin
                cb.showTextAligned(PdfContentByte.ALIGN_RIGHT, pageText, document.right(), document.bottom() - 18, 0);
            } catch (Exception e) {
                // Fail-safe silently
            } finally {
                cb.endText();
                cb.restoreState();
            }
        }
    }
}
