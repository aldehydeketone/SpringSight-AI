package com.mihir.springsightai.report.service;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.exception.ReportNotFoundException;
import com.mihir.springsightai.exception.UnauthorizedReportAccessException;
import com.mihir.springsightai.report.dto.AnalysisReportResponse;
import com.mihir.springsightai.report.dto.DashboardSummaryResponse;
import com.mihir.springsightai.report.entity.AnalysisReport;
import com.mihir.springsightai.report.repository.AnalysisReportRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Locale;

@Service
@RequiredArgsConstructor
public class AnalysisReportService {

    private final AnalysisReportRepository analysisReportRepository;

    @Transactional
    public AnalysisReportResponse saveReport(AiAnalysisRequest request, AiAnalysisResponse aiResponse) {
        User user = getAuthenticatedUser();

        AnalysisReport report = AnalysisReport.builder()
                .filename(request.getFilename())
                .totalLogs(request.getTotalLogs())
                .errorCount(request.getErrorCount())
                .warnCount(request.getWarnCount())
                .infoCount(request.getInfoCount())
                .rootCause(aiResponse.getRootCause())
                .severity(normalize(aiResponse.getSeverity()))
                .impact(aiResponse.getImpact())
                .recommendedFix(aiResponse.getRecommendedFix())
                .preventionSteps(aiResponse.getPreventionSteps())
                .confidence(normalize(aiResponse.getConfidence()))
                .user(user)
                .build();

        return toResponse(analysisReportRepository.save(report));
    }

    @Transactional(readOnly = true)
    public List<AnalysisReportResponse> getUserReports() {
        Long userId = getAuthenticatedUser().getId();
        return analysisReportRepository.findAllByUserIdOrderByCreatedAtDesc(userId)
                .stream()
                .map(this::toResponse)
                .toList();
    }

    @Transactional(readOnly = true)
    public AnalysisReportResponse getReportById(Long reportId) {
        return toResponse(getOwnedReport(reportId));
    }

    @Transactional
    public void deleteReport(Long reportId) {
        analysisReportRepository.delete(getOwnedReport(reportId));
    }

    @Transactional(readOnly = true)
    public DashboardSummaryResponse getDashboardSummary() {
        Long userId = getAuthenticatedUser().getId();
        return DashboardSummaryResponse.builder()
                .totalReports(analysisReportRepository.countByUserId(userId))
                .criticalReports(analysisReportRepository.countByUserIdAndSeverity(userId, "CRITICAL"))
                .highReports(analysisReportRepository.countByUserIdAndSeverity(userId, "HIGH"))
                .mediumReports(analysisReportRepository.countByUserIdAndSeverity(userId, "MEDIUM"))
                .lowReports(analysisReportRepository.countByUserIdAndSeverity(userId, "LOW"))
                .totalErrorsAnalyzed(analysisReportRepository.sumErrorCountByUserId(userId))
                .build();
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

    private String normalize(String value) {
        return value == null ? null : value.trim().toUpperCase(Locale.ROOT);
    }

    private AnalysisReportResponse toResponse(AnalysisReport report) {
        return AnalysisReportResponse.builder()
                .id(report.getId())
                .filename(report.getFilename())
                .totalLogs(report.getTotalLogs())
                .errorCount(report.getErrorCount())
                .warnCount(report.getWarnCount())
                .infoCount(report.getInfoCount())
                .rootCause(report.getRootCause())
                .severity(report.getSeverity())
                .impact(report.getImpact())
                .recommendedFix(report.getRecommendedFix())
                .preventionSteps(report.getPreventionSteps())
                .confidence(report.getConfidence())
                .createdAt(report.getCreatedAt())
                .build();
    }
}
