package com.mihir.springsightai.report.controller;

import com.mihir.springsightai.report.dto.AnalysisReportResponse;
import com.mihir.springsightai.report.dto.DashboardSummaryResponse;
import com.mihir.springsightai.report.service.AnalysisReportService;
import com.mihir.springsightai.report.service.PdfReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.DeleteMapping;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/reports")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Reports", description = "Report history, dashboard, deletion, and PDF export APIs")
public class AnalysisReportController {

    private final AnalysisReportService analysisReportService;
    private final PdfReportService pdfReportService;

    @GetMapping
    @Operation(summary = "Get report history for authenticated user")
    public ResponseEntity<List<AnalysisReportResponse>> getUserReports() {
        return ResponseEntity.ok(analysisReportService.getUserReports());
    }

    @GetMapping("/dashboard")
    @Operation(summary = "Get dashboard summary for authenticated user")
    public ResponseEntity<DashboardSummaryResponse> getDashboardSummary() {
        return ResponseEntity.ok(analysisReportService.getDashboardSummary());
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get one report by ID")
    public ResponseEntity<AnalysisReportResponse> getReportById(@PathVariable Long id) {
        return ResponseEntity.ok(analysisReportService.getReportById(id));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete one report by ID")
    public ResponseEntity<Void> deleteReport(@PathVariable Long id) {
        analysisReportService.deleteReport(id);
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }

    @GetMapping("/{id}/pdf")
    @Operation(summary = "Download report as PDF")
    public ResponseEntity<byte[]> getReportPdf(@PathVariable Long id) {
        byte[] pdfBytes = pdfReportService.generateReportPdf(id);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_PDF);
        headers.setContentDispositionFormData("attachment", "analysis-report-" + id + ".pdf");
        headers.setContentLength(pdfBytes.length);

        return new ResponseEntity<>(pdfBytes, headers, HttpStatus.OK);
    }
}
