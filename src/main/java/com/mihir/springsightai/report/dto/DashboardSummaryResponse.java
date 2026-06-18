package com.mihir.springsightai.report.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DashboardSummaryResponse {
    private long totalReports;
    private long criticalReports;
    private long highReports;
    private long mediumReports;
    private long lowReports;
    private long totalErrorsAnalyzed;
}
