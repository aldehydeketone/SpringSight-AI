package com.mihir.springsightai.ai.service;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import com.mihir.springsightai.exception.UnauthorizedLogFileAccessException;
import com.mihir.springsightai.log.entity.LogFile;
import com.mihir.springsightai.log.repository.LogFileRepository;
import com.mihir.springsightai.report.entity.AnalysisReport;
import com.mihir.springsightai.report.repository.AnalysisReportRepository;
import com.mihir.springsightai.report.service.AnalysisReportService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.cache.annotation.Cacheable;
import org.springframework.stereotype.Service;

import java.util.Optional;

@Slf4j
@Service
@RequiredArgsConstructor
public class AiOrchestrationService {

    private final GeminiService geminiService;
    private final AnalysisReportService analysisReportService;
    private final AnalysisReportRepository analysisReportRepository;
    private final LogFileRepository logFileRepository;

    @Cacheable(value = "aiAnalysis", key = "#request.logFileId", condition = "#request.logFileId != null")
    public AiAnalysisResponse processRootCauseAnalysis(AiAnalysisRequest request) {
        log.info("[AiOrchestrationService] Cache miss for logFileId={}. Checking MySQL for existing report.", request.getLogFileId());

        Long currentUserId = analysisReportService.getCurrentUserId();
        Optional<AnalysisReport> existingReport = Optional.empty();

        if (request.getLogFileId() != null) {
            Optional<LogFile> logFileOpt = logFileRepository.findById(request.getLogFileId());
            if (logFileOpt.isPresent()) {
                LogFile logFile = logFileOpt.get();
                if (!logFile.getUploadedByUserId().equals(currentUserId)) {
                    throw new UnauthorizedLogFileAccessException(request.getLogFileId());
                }
                log.info("[AiOrchestrationService] Querying MySQL by logFileId={}", request.getLogFileId());
                existingReport = analysisReportRepository.findFirstByUserIdAndLogFileIdOrderByCreatedAtDesc(currentUserId, request.getLogFileId());
            }
        } else if (request.getFilename() != null && !request.getFilename().isBlank()) {
            log.info("[AiOrchestrationService] Querying MySQL by filename={}", request.getFilename());
            existingReport = analysisReportRepository.findFirstByUserIdAndFilenameOrderByCreatedAtDesc(currentUserId, request.getFilename());
        }

        if (existingReport.isPresent()) {
            log.info("[AiOrchestrationService] Found existing report in MySQL for filename={}. Returning cached DB result.", request.getFilename());
            AnalysisReport report = existingReport.get();
            return AiAnalysisResponse.builder()
                    .rootCause(report.getRootCause())
                    .severity(report.getSeverity())
                    .impact(report.getImpact())
                    .recommendedFix(report.getRecommendedFix())
                    .preventionSteps(report.getPreventionSteps())
                    .confidence(report.getConfidence())
                    .build();
        }

        log.info("[AiOrchestrationService] No report found in MySQL. Invoking Gemini API.");
        AiAnalysisResponse response = geminiService.generateRootCauseAnalysis(request);

        log.info("[AiOrchestrationService] Saving new report to MySQL.");
        analysisReportService.saveReport(request, response);

        return response;
    }
}