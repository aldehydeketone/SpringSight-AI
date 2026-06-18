package com.mihir.springsightai.log.controller;

import com.mihir.springsightai.log.dto.AnalysisResponse;
import com.mihir.springsightai.log.service.LogAnalysisService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing the log analysis API.
 * Protected by JWT security rules.
 */
@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class LogAnalysisController {

    private final LogAnalysisService logAnalysisService;

    /**
     * GET /api/logs/{id}/analysis
     * Retrieves statistics, health status, and top error summaries for a parsed log file.
     *
     * @param id the ID of the log file to analyze
     * @return 200 OK with the AnalysisResponse DTO payload
     */
    @GetMapping("/{id}/analysis")
    public ResponseEntity<AnalysisResponse> getLogAnalysis(@PathVariable Long id) {
        log.info("[LogAnalysisController] Request received for log analysis of fileId={}", id);
        AnalysisResponse response = logAnalysisService.analyzeLogs(id);
        return ResponseEntity.ok(response);
    }
}
