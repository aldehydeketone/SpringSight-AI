package com.mihir.springsightai.ai.service;

import com.mihir.springsightai.log.entity.ParsedLog;
import com.mihir.springsightai.log.repository.ParsedLogRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.stereotype.Component;

import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.stream.Collectors;

/**
 * Builds an enriched {@link LogAiContext} from {@code ParsedLog} records stored in the database.
 *
 * <p><b>Responsibilities:</b>
 * <ol>
 *   <li>Fetch only ERROR and WARN log entries to keep the prompt token budget reasonable.</li>
 *   <li>Extract distinct exception class names and their occurrence frequency.</li>
 *   <li>Select and format the most relevant log lines for prompt injection.</li>
 *   <li>Collect stack trace fragments embedded in log messages.</li>
 * </ol>
 *
 * <p><b>Budget constraints:</b>
 * <ul>
 *   <li>Up to 30 ERROR log lines</li>
 *   <li>Up to 10 WARN log lines</li>
 *   <li>Up to 15 distinct stack trace fragments (first 20 lines each)</li>
 * </ul>
 *
 * <p>This class is intentionally package-private in its concern — it is only invoked by
 * {@link GeminiService} and has no public REST surface.
 */
@Slf4j
@Component
class LogAiContextBuilder {

    // Maximum entries selected per log level for the prompt
    private static final int MAX_ERROR_LINES = 30;
    private static final int MAX_WARN_LINES  = 10;
    private static final int MAX_STACK_FRAGMENTS = 15;
    private static final int MAX_STACK_LINES_PER_FRAGMENT = 20;

    private static final List<String> AI_LEVELS = List.of("ERROR", "WARN");

    private static final DateTimeFormatter TS_FORMAT =
            DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm:ss");

    /**
     * Regex to detect Java exception class names in log message text.
     * Matches patterns like {@code com.mysql.cj.jdbc.exceptions.CommunicationsException}
     * or {@code java.lang.NullPointerException}.
     */
    private static final Pattern EXCEPTION_CLASS_PATTERN = Pattern.compile(
            "(?:[a-z][a-zA-Z0-9_]*\\.)+[A-Z][a-zA-Z0-9_]*(?:Exception|Error|Failure|Fault)"
    );

    private final ParsedLogRepository parsedLogRepository;

    LogAiContextBuilder(ParsedLogRepository parsedLogRepository) {
        this.parsedLogRepository = parsedLogRepository;
    }

    /**
     * Fetches ERROR/WARN logs for the given file and assembles a {@link LogAiContext}.
     *
     * @param logFileId the database ID of the {@code LogFile} being analysed
     * @return populated context; never {@code null}, may be {@link LogAiContext#isEmpty() empty}
     *         if no ERROR or WARN entries exist for this file
     */
    LogAiContext build(Long logFileId) {
        log.info("[LogAiContextBuilder] Building AI context for logFileId={}", logFileId);

        List<ParsedLog> relevantLogs =
                parsedLogRepository.findByLogFileIdAndLogLevelIn(logFileId, AI_LEVELS);

        if (relevantLogs.isEmpty()) {
            log.warn("[LogAiContextBuilder] No ERROR/WARN entries found for logFileId={}", logFileId);
            return new LogAiContext(Map.of(), List.of(), List.of(), List.of(), null, null);
        }

        log.info("[LogAiContextBuilder] Loaded {} ERROR/WARN entries for logFileId={}",
                relevantLogs.size(), logFileId);

        // Partition into ERROR and WARN
        List<ParsedLog> errors = relevantLogs.stream()
                .filter(l -> "ERROR".equalsIgnoreCase(l.getLogLevel()))
                .sorted(Comparator.comparing(ParsedLog::getTimestamp,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        List<ParsedLog> warns = relevantLogs.stream()
                .filter(l -> "WARN".equalsIgnoreCase(l.getLogLevel()))
                .sorted(Comparator.comparing(ParsedLog::getTimestamp,
                        Comparator.nullsLast(Comparator.naturalOrder())))
                .collect(Collectors.toList());

        // --- Exception frequency map (from ERROR entries only) ---
        Map<String, Long> exceptionFrequency = buildExceptionFrequency(errors);

        // --- Formatted log lines ---
        List<String> errorLogLines  = formatLogLines(errors, MAX_ERROR_LINES);
        List<String> warnLogLines   = formatLogLines(warns,  MAX_WARN_LINES);

        // --- Stack trace fragments from error messages ---
        List<String> stackTraceFragments = extractStackTraces(errors);

        // --- Time window ---
        String earliest = relevantLogs.stream()
                .filter(l -> l.getTimestamp() != null)
                .min(Comparator.comparing(ParsedLog::getTimestamp))
                .map(l -> l.getTimestamp().format(TS_FORMAT))
                .orElse(null);

        String latest = relevantLogs.stream()
                .filter(l -> l.getTimestamp() != null)
                .max(Comparator.comparing(ParsedLog::getTimestamp))
                .map(l -> l.getTimestamp().format(TS_FORMAT))
                .orElse(null);

        log.info("[LogAiContextBuilder] Context built — errors={}, warns={}, exceptions={}, traces={}",
                errorLogLines.size(), warnLogLines.size(),
                exceptionFrequency.size(), stackTraceFragments.size());

        return new LogAiContext(
                exceptionFrequency,
                errorLogLines,
                warnLogLines,
                stackTraceFragments,
                earliest,
                latest
        );
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Extracts exception class names from log messages and counts their occurrences.
     * Results are sorted by frequency descending and limited to the top 10.
     */
    private Map<String, Long> buildExceptionFrequency(List<ParsedLog> errors) {
        Map<String, Long> raw = errors.stream()
                .flatMap(entry -> findExceptionClasses(entry.getMessage()).stream())
                .collect(Collectors.groupingBy(name -> name, Collectors.counting()));

        // Sort descending by count, keep top 10, preserve insertion order
        return raw.entrySet().stream()
                .sorted(Map.Entry.<String, Long>comparingByValue(Comparator.reverseOrder()))
                .limit(10)
                .collect(Collectors.toMap(
                        Map.Entry::getKey,
                        Map.Entry::getValue,
                        (a, b) -> a,
                        LinkedHashMap::new
                ));
    }

    /**
     * Scans a message string for Java exception/error class names using a regex.
     *
     * @param message the full log message (may be multiline with appended stack trace)
     * @return list of distinct exception class names found, empty if none
     */
    private List<String> findExceptionClasses(String message) {
        if (message == null || message.isBlank()) return List.of();
        List<String> found = new ArrayList<>();
        Matcher m = EXCEPTION_CLASS_PATTERN.matcher(message);
        while (m.find()) {
            String candidate = m.group();
            if (!found.contains(candidate)) {
                found.add(candidate);
            }
        }
        return found;
    }

    /**
     * Formats each {@link ParsedLog} entry into a single-line string for prompt injection.
     * The format is: {@code [TIMESTAMP] [LEVEL] <first line of message>}
     *
     * <p>Only the first line of the message is included in the log-line section;
     * stack traces are collected separately in
     * {@link #extractStackTraces(List)}.
     */
    private List<String> formatLogLines(List<ParsedLog> entries, int maxEntries) {
        return entries.stream()
                .limit(maxEntries)
                .map(entry -> {
                    String ts      = entry.getTimestamp() != null
                            ? entry.getTimestamp().format(TS_FORMAT)
                            : "unknown-time";
                    String level   = entry.getLogLevel() != null ? entry.getLogLevel() : "UNKNOWN";
                    String message = firstLine(entry.getMessage());
                    return String.format("[%s] [%s] %s", ts, level, message);
                })
                .collect(Collectors.toList());
    }

    /**
     * Collects embedded stack traces from error messages.
     * {@link com.mihir.springsightai.log.service.LogParserService} appends continuation
     * lines (e.g., {@code at com.example...}) to the parent entry's message. This method
     * extracts those multi-line sections.
     *
     * <p>Each fragment is truncated to {@value #MAX_STACK_LINES_PER_FRAGMENT} lines to
     * stay within the prompt token budget.
     */
    private List<String> extractStackTraces(List<ParsedLog> errors) {
        List<String> fragments = new ArrayList<>();

        for (ParsedLog entry : errors) {
            if (fragments.size() >= MAX_STACK_FRAGMENTS) break;

            String message = entry.getMessage();
            if (message == null || !message.contains("\n")) continue;

            // The message contains a stack trace if any line starts with "at " or "Caused by:"
            String[] lines = message.split("\n");
            boolean hasTrace = false;
            for (String line : lines) {
                String trimmed = line.trim();
                if (trimmed.startsWith("at ") || trimmed.startsWith("Caused by:")) {
                    hasTrace = true;
                    break;
                }
            }

            if (!hasTrace) continue;

            // Collect up to MAX_STACK_LINES_PER_FRAGMENT lines
            StringBuilder fragment = new StringBuilder();
            int count = 0;
            for (String line : lines) {
                if (count >= MAX_STACK_LINES_PER_FRAGMENT) {
                    fragment.append("    ... (truncated)");
                    break;
                }
                fragment.append(line).append("\n");
                count++;
            }

            String built = fragment.toString().trim();
            if (!built.isBlank()) {
                fragments.add(built);
            }
        }

        return fragments;
    }

    /** Returns only the first non-blank line of a potentially multiline message. */
    private String firstLine(String message) {
        if (message == null) return "";
        int newline = message.indexOf('\n');
        String first = newline >= 0 ? message.substring(0, newline) : message;
        return first.trim();
    }
}
