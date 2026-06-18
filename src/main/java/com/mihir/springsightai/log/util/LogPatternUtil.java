package com.mihir.springsightai.log.util;

import java.util.regex.Pattern;

/**
 * Utility class providing the compiled regex {@link Pattern} used to parse
 * standard application log lines of the form:
 * <pre>
 *   2026-06-18 10:15:23 INFO User logged in
 * </pre>
 *
 * <p>Capture groups:
 * <ol>
 *   <li>Timestamp  — {@code yyyy-MM-dd HH:mm:ss}</li>
 *   <li>Log Level  — one of INFO, WARN, ERROR, DEBUG (case-insensitive)</li>
 *   <li>Message    — everything that follows on the same line</li>
 * </ol>
 *
 * <p>Lines that do not match (stack traces, blank lines, custom formats) are
 * counted as "ignored" and skipped gracefully by the parser.
 */
public final class LogPatternUtil {

    /**
     * Regex that matches a standard log line and extracts three groups:
     * <ul>
     *   <li>Group 1 – timestamp    : {@code \d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}}</li>
     *   <li>Group 2 – log level    : {@code INFO|WARN|ERROR|DEBUG} (case-insensitive)</li>
     *   <li>Group 3 – message      : {@code .+} (rest of line, trimmed)</li>
     * </ul>
     */
    public static final Pattern LOG_PATTERN = Pattern.compile(
            "^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2})\\s+(INFO|WARN|ERROR|DEBUG|UNKNOWN)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Fallback pattern used when a line starts with a valid timestamp but has
     * an unrecognised log level — lets the parser still capture the message
     * and tag the level as {@code UNKNOWN} rather than ignoring the line.
     */
    public static final Pattern UNKNOWN_LEVEL_PATTERN = Pattern.compile(
            "^(\\d{4}-\\d{2}-\\d{2}\\s\\d{2}:\\d{2}:\\d{2})\\s+(\\S+)\\s+(.+)$"
    );

    /** Prevent instantiation — this is a pure utility class. */
    private LogPatternUtil() {
        throw new UnsupportedOperationException("LogPatternUtil is a utility class");
    }
}
