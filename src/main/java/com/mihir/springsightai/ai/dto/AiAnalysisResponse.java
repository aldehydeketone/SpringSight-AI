package com.mihir.springsightai.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO for AI Root Cause Analysis.
 * Maps directly to the structured JSON returned by Gemini.
 *
 * Severity values: LOW, MEDIUM, HIGH, CRITICAL
 * Confidence values: LOW, MEDIUM, HIGH
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisResponse {

    private String rootCause;
    private String severity;
    private String impact;
    private String recommendedFix;
    private String preventionSteps;
    private String confidence;
}
