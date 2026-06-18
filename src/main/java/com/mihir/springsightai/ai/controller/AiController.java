package com.mihir.springsightai.ai.controller;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import com.mihir.springsightai.ai.service.GeminiService;
import com.mihir.springsightai.report.service.AnalysisReportService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller for AI-powered log analysis endpoints.
 * JWT authentication required for all endpoints.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Root Cause Analysis", description = "Gemini-powered root cause analysis and report persistence")
public class AiController {

    private final GeminiService geminiService;
    private final AnalysisReportService analysisReportService;

    /**
     * Performs AI Root Cause Analysis on summarized log data.
     * Accepts analysis summary (NOT raw logs) and returns structured diagnosis.
     *
     * @param request Summarized log analysis data
     * @return AI-generated root cause analysis with severity, impact, fix, and prevention
     */
    @PostMapping("/root-cause")
    @Operation(summary = "Generate AI root cause analysis and save report")
    public ResponseEntity<AiAnalysisResponse> analyzeRootCause(@Valid @RequestBody AiAnalysisRequest request) {
        log.info("[AiController] Root cause analysis requested for file: {}", request.getFilename());

        AiAnalysisResponse response = geminiService.generateRootCauseAnalysis(request);
        analysisReportService.saveReport(request, response);

        log.info("[AiController] Root cause analysis completed. Severity: {}, Confidence: {}",
                response.getSeverity(), response.getConfidence());

        return ResponseEntity.ok(response);
    }
}
