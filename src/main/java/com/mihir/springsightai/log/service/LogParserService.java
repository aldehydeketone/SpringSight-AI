package com.mihir.springsightai.log.service;

import com.mihir.springsightai.exception.LogFileNotFoundException;
import com.mihir.springsightai.exception.LogParseException;
import com.mihir.springsightai.log.dto.ParseResponse;
import com.mihir.springsightai.log.entity.LogFile;
import com.mihir.springsightai.log.entity.ParsedLog;
import com.mihir.springsightai.log.repository.LogFileRepository;
import com.mihir.springsightai.log.repository.ParsedLogRepository;
import com.mihir.springsightai.log.util.LogPatternUtil;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.time.format.DateTimeParseException;
import java.util.ArrayList;
import java.util.List;
import java.util.Set;
import java.util.regex.Matcher;

/**
 * Core service responsible for reading an uploaded log file from disk,
 * parsing each line into structured {@link ParsedLog} entities, and
 * batch-saving them to the {@code parsed_logs} table.
 *
 * <p><b>Architecture:</b>
 * <pre>
 *   LogParseController  →  LogParserService  →  ParsedLogRepository
 *                                          ↓
 *                                    LogFileRepository  (fetch metadata)
 * </pre>
 *
 * <p>All parsing logic lives here — the controller only delegates and formats
 * the response.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogParserService {

    private final LogFileRepository logFileRepository;
    private final ParsedLogRepository parsedLogRepository;

    /** Recognised log level tokens. Lines with other tokens get level UNKNOWN. */
    private static final Set<String> KNOWN_LEVELS = Set.of("INFO", "WARN", "ERROR", "DEBUG");

    /** Formatter matching the timestamp captured by {@link LogPatternUtil#LOG_PATTERN}. */
    private static final DateTimeFormatter TIMESTAMP_FORMATTER =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Parses the log file identified by {@code logFileId}.
     *
     * <p>Steps:
     * <ol>
     *   <li>Fetch {@link LogFile} metadata from the database — throws
     *       {@link LogFileNotFoundException} (404) if the record is missing.</li>
     *   <li>Locate the physical file on disk — throws
     *       {@link LogFileNotFoundException} (404) if the path doesn't exist.</li>
     *   <li>Stream lines; skip blank lines.</li>
     *   <li>Match each line against the primary or fallback regex pattern.</li>
     *   <li>Convert matched lines to {@link ParsedLog} entities.</li>
     *   <li>Batch-save all entries in a single transaction.</li>
     *   <li>Return {@link ParseResponse} statistics.</li>
     * </ol>
     *
     * @param logFileId ID of the {@code LogFile} record to parse
     * @return {@link ParseResponse} with counts of parsed vs ignored lines
     * @throws LogFileNotFoundException if no database record or disk file is found
     * @throws LogParseException        if the file is empty or contains zero parseable lines
     */
    @Transactional
    public ParseResponse parseLogFile(Long logFileId) {

        // ------------------------------------------------------------------ 1
        log.info("[LogParserService] Started parsing file — logFileId={}", logFileId);

        LogFile logFile = logFileRepository.findById(logFileId)
                .orElseThrow(() -> new LogFileNotFoundException(logFileId));

        // ------------------------------------------------------------------ 2
        Path filePath = Paths.get(logFile.getFilePath());
        if (!Files.exists(filePath)) {
            log.error("[LogParserService] Physical file not found on disk: {}", filePath);
            throw new LogFileNotFoundException(
                    "Physical file not found on disk for log file id: " + logFileId);
        }

        // ------------------------------------------------------------------ 3  read lines
        List<String> lines;
        try {
            lines = Files.readAllLines(filePath);
        } catch (IOException ex) {
            log.error("[LogParserService] Failed to read file: {}", filePath, ex);
            throw new LogParseException("Failed to read log file from disk: " + ex.getMessage(), ex);
        }

        int totalLines    = lines.size();
        int parsedEntries = 0;
        int ignoredLines  = 0;

        if (totalLines == 0) {
            throw new LogParseException("Unsupported log format: file is completely empty");
        }

        // ------------------------------------------------------------------ 4  parse
        List<ParsedLog> batch = new ArrayList<>();

        for (String rawLine : lines) {
            String line = rawLine.trim();

            // Skip blank lines
            if (line.isEmpty()) {
                ignoredLines++;
                continue;
            }

            ParsedLog entry = tryParseLine(line, logFileId);

            if (entry != null) {
                batch.add(entry);
                parsedEntries++;
            } else {
                ignoredLines++;
            }
        }

        // Guard: if nothing was parseable, signal unsupported format
        if (parsedEntries == 0) {
            throw new LogParseException(
                    "Unsupported log format: no parseable entries found in file id " + logFileId);
        }

        // ------------------------------------------------------------------ 5  save
        // Delete existing parsed logs to prevent duplicates on re-parse
        parsedLogRepository.deleteByLogFileId(logFileId);
        parsedLogRepository.saveAll(batch);

        log.info("[LogParserService] Completed parsing — logFileId={}, total={}, parsed={}, ignored={}",
                logFileId, totalLines, parsedEntries, ignoredLines);

        // ------------------------------------------------------------------ 6  respond
        return ParseResponse.builder()
                .success(true)
                .fileId(logFileId)
                .totalLines(totalLines)
                .parsedEntries(parsedEntries)
                .ignoredLines(ignoredLines)
                .build();
    }

    // ---------------------------------------------------------------------- helpers

    /**
     * Attempts to parse a single non-blank log line into a {@link ParsedLog} entity.
     *
     * <p>Strategy:
     * <ol>
     *   <li>Try the primary {@link LogPatternUtil#LOG_PATTERN} (known level).</li>
     *   <li>If that fails, try the fallback {@link LogPatternUtil#UNKNOWN_LEVEL_PATTERN}
     *       and tag the level as {@code UNKNOWN}.</li>
     *   <li>If neither matches (e.g. stack-trace continuation), return {@code null}.</li>
     * </ol>
     *
     * @param line      a single trimmed, non-empty log line
     * @param logFileId parent file ID to attach to the entity
     * @return a populated {@link ParsedLog} or {@code null} if the line cannot be parsed
     */
    private ParsedLog tryParseLine(String line, Long logFileId) {

        // --- primary pattern (level must be INFO / WARN / ERROR / DEBUG / UNKNOWN)
        Matcher primary = LogPatternUtil.LOG_PATTERN.matcher(line);
        if (primary.matches()) {
            String rawLevel = primary.group(2).toUpperCase();
            String level = KNOWN_LEVELS.contains(rawLevel) ? rawLevel : "UNKNOWN";
            return buildEntry(logFileId, primary.group(1), level, primary.group(3).trim());
        }

        // --- fallback pattern (any non-space token as "level")
        Matcher fallback = LogPatternUtil.UNKNOWN_LEVEL_PATTERN.matcher(line);
        if (fallback.matches()) {
            return buildEntry(logFileId, fallback.group(1), "UNKNOWN", fallback.group(3).trim());
        }

        return null; // stack trace continuation, comment line, etc.
    }

    /**
     * Converts raw string fields extracted from a regex match into a
     * {@link ParsedLog} JPA entity ready for batch insert.
     *
     * @param logFileId      parent log file ID
     * @param rawTimestamp   timestamp string in {@code yyyy-MM-dd HH:mm:ss} format
     * @param level          normalised log level string
     * @param message        trimmed log message
     * @return populated {@link ParsedLog} (createdAt is set by {@code @PrePersist})
     */
    private ParsedLog buildEntry(Long logFileId, String rawTimestamp, String level, String message) {
        LocalDateTime timestamp = null;
        try {
            timestamp = LocalDateTime.parse(rawTimestamp, TIMESTAMP_FORMATTER);
        } catch (DateTimeParseException ex) {
            log.warn("[LogParserService] Could not parse timestamp '{}', storing null", rawTimestamp);
        }

        return ParsedLog.builder()
                .logFileId(logFileId)
                .timestamp(timestamp)
                .logLevel(level)
                .message(message)
                .build();
    }
}
