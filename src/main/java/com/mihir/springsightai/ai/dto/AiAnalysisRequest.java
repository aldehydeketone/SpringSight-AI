package com.mihir.springsightai.ai.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Request DTO for AI Root Cause Analysis.
 * Contains summarized log analysis data — NOT raw log content.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AiAnalysisRequest {

    private String filename;
    private int totalLogs;
    private int errorCount;
    private int warnCount;
    private int infoCount;

    private List<String> topErrors;
    private List<String> sampleErrorLogs;
}
