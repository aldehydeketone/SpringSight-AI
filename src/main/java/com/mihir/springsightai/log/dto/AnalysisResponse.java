package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Response DTO returned after log file analysis, including counts,
 * health status, top errors/warnings, recent errors, and dynamic summary text.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisResponse {
    private Long fileId;
    private Long totalLogs;
    private Long infoCount;
    private Long warnCount;
    private Long errorCount;
    private Long debugCount;
    private Long unknownCount;
    private String healthStatus;
    private List<ErrorSummary> topErrors;
    private List<WarningSummary> topWarnings;
    private List<RecentError> recentErrors;
    private String summary;
}
