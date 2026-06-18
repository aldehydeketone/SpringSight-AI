package com.mihir.springsightai.ai.dto;

import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
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

    @NotBlank
    @Size(max = 255)
    private String filename;
    @Min(0)
    private int totalLogs;
    @Min(0)
    private int errorCount;
    @Min(0)
    private int warnCount;
    @Min(0)
    private int infoCount;

    private List<String> topErrors;
    private List<String> sampleErrorLogs;
}
