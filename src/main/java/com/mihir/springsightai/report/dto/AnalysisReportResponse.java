package com.mihir.springsightai.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AnalysisReportResponse {
    private Long id;
    private String filename;
    private Integer totalLogs;
    private Integer errorCount;
    private Integer warnCount;
    private Integer infoCount;
    private String rootCause;
    private String severity;
    private String impact;
    private String recommendedFix;
    private String preventionSteps;
    private String confidence;
    private LocalDateTime createdAt;
}
