package com.mihir.springsightai.log.service;

import com.mihir.springsightai.exception.LogFileNotFoundException;
import com.mihir.springsightai.exception.NoParsedLogsException;
import com.mihir.springsightai.log.dto.AnalysisResponse;
import com.mihir.springsightai.log.dto.ErrorSummary;
import com.mihir.springsightai.log.dto.RecentError;
import com.mihir.springsightai.log.dto.WarningSummary;
import com.mihir.springsightai.log.entity.LogFile;
import com.mihir.springsightai.log.entity.ParsedLog;
import com.mihir.springsightai.log.repository.LogFileRepository;
import com.mihir.springsightai.log.repository.ParsedLogRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

/**
 * Service handling all log analysis logic.
 * Processes parsed logs associated with a log file to extract statistics,
 * trends, health status, and top repeated messages.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogAnalysisService {

    private final LogFileRepository logFileRepository;
    private final ParsedLogRepository parsedLogRepository;

    /**
     * Performs analysis on the parsed logs of the specified file ID.
     *
     * @param fileId the ID of the log file to analyze
     * @return the AnalysisResponse containing calculated statistics and summaries
     * @throws LogFileNotFoundException if the file record does not exist
     * @throws NoParsedLogsException    if no parsed logs are available for the file
     */
    @Transactional(readOnly = true)
    public AnalysisResponse analyzeLogs(Long fileId) {
        log.info("[LogAnalysisService] Starting analysis for fileId={}", fileId);

        // 1. Validate file exists in DB
        LogFile logFile = logFileRepository.findById(fileId)
                .orElseThrow(() -> new LogFileNotFoundException("Log file not found"));

        // 2. Fetch parsed logs
        List<ParsedLog> parsedLogs = parsedLogRepository.findByLogFileId(fileId);
        if (parsedLogs.isEmpty()) {
            log.warn("[LogAnalysisService] No parsed logs found for fileId={}", fileId);
            throw new NoParsedLogsException("No parsed logs available. Parse file first.");
        }

        long totalLogs = parsedLogs.size();

        // 3. Count levels using streams
        long infoCount = parsedLogs.stream()
                .filter(log -> "INFO".equalsIgnoreCase(log.getLogLevel()))
                .count();

        long warnCount = parsedLogs.stream()
                .filter(log -> "WARN".equalsIgnoreCase(log.getLogLevel()))
                .count();

        long errorCount = parsedLogs.stream()
                .filter(log -> "ERROR".equalsIgnoreCase(log.getLogLevel()))
                .count();

        long debugCount = parsedLogs.stream()
                .filter(log -> "DEBUG".equalsIgnoreCase(log.getLogLevel()))
                .count();

        long unknownCount = parsedLogs.stream()
                .filter(log -> "UNKNOWN".equalsIgnoreCase(log.getLogLevel())
                        || (!"INFO".equalsIgnoreCase(log.getLogLevel())
                            && !"WARN".equalsIgnoreCase(log.getLogLevel())
                            && !"ERROR".equalsIgnoreCase(log.getLogLevel())
                            && !"DEBUG".equalsIgnoreCase(log.getLogLevel())))
                .count();

        // 4. Calculate top 5 errors
        List<ErrorSummary> topErrors = parsedLogs.stream()
                .filter(log -> "ERROR".equalsIgnoreCase(log.getLogLevel()))
                .collect(Collectors.groupingBy(
                        ParsedLog::getMessage,
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(entry -> new ErrorSummary(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 5. Calculate top 5 warnings
        List<WarningSummary> topWarnings = parsedLogs.stream()
                .filter(log -> "WARN".equalsIgnoreCase(log.getLogLevel()))
                .collect(Collectors.groupingBy(
                        ParsedLog::getMessage,
                        Collectors.counting()
                ))
                .entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(5)
                .map(entry -> new WarningSummary(entry.getKey(), entry.getValue()))
                .collect(Collectors.toList());

        // 6. Calculate Health Status based on error percentage
        double errorPercentage = ((double) errorCount / totalLogs) * 100.0;
        String healthStatus;
        if (errorPercentage <= 5.0) {
            healthStatus = "GOOD";
        } else if (errorPercentage <= 15.0) {
            healthStatus = "WARNING";
        } else {
            healthStatus = "CRITICAL";
        }

        // 7. Get latest 10 error entries (Recent Errors)
        List<RecentError> recentErrors = parsedLogs.stream()
                .filter(logEntry -> "ERROR".equalsIgnoreCase(logEntry.getLogLevel()))
                .sorted((a, b) -> {
                    if (a.getTimestamp() == null || b.getTimestamp() == null) {
                        return 0;
                    }
                    return b.getTimestamp().compareTo(a.getTimestamp());
                })
                .limit(10)
                .map(logEntry -> new RecentError(logEntry.getTimestamp(), logEntry.getMessage()))
                .collect(Collectors.toList());

        // 8. Generate Summary Sentence
        String mostCommonError = !topErrors.isEmpty() ? topErrors.get(0).getMessage() : "None";
        String summary = String.format(
                "Analysis completed. Total logs: %d. Errors detected: %d. Warnings detected: %d. Most common error: %s. System health: %s.",
                totalLogs, errorCount, warnCount, mostCommonError, healthStatus
        );

        log.info("[LogAnalysisService] Analysis completed for fileId={}. HealthStatus={}", fileId, healthStatus);

        return AnalysisResponse.builder()
                .fileId(fileId)
                .totalLogs(totalLogs)
                .infoCount(infoCount)
                .warnCount(warnCount)
                .errorCount(errorCount)
                .debugCount(debugCount)
                .unknownCount(unknownCount)
                .healthStatus(healthStatus)
                .topErrors(topErrors)
                .topWarnings(topWarnings)
                .recentErrors(recentErrors)
                .summary(summary)
                .build();
    }
}
