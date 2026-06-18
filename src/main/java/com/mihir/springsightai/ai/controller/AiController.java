package com.mihir.springsightai.ai.controller;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import com.mihir.springsightai.ai.service.GeminiService;
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
public class AiController {

    private final GeminiService geminiService;

    /**
     * Performs AI Root Cause Analysis on summarized log data.
     * Accepts analysis summary (NOT raw logs) and returns structured diagnosis.
     *
     * @param request Summarized log analysis data
     * @return AI-generated root cause analysis with severity, impact, fix, and prevention
     */
    @PostMapping("/root-cause")
    public ResponseEntity<AiAnalysisResponse> analyzeRootCause(@RequestBody AiAnalysisRequest request) {
        log.info("[AiController] Root cause analysis requested for file: {}", request.getFilename());

        AiAnalysisResponse response = geminiService.generateRootCauseAnalysis(request);

        log.info("[AiController] Root cause analysis completed. Severity: {}, Confidence: {}",
                response.getSeverity(), response.getConfidence());

        return ResponseEntity.ok(response);
    }
}
