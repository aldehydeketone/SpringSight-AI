package com.mihir.springsightai.log.util;

import java.util.regex.Pattern;

/** Compiled patterns shared by the log parser. */
public final class LogPatternUtil {

    /**
     * Date/time accepted by the parser. It supports the traditional logging
     * separator, ISO-8601's {@code T}, optional fractional seconds and an
     * optional UTC/offset suffix.
     */
    public static final String TIMESTAMP_PATTERN =
            "\\d{4}-\\d{2}-\\d{2}[ T]\\d{2}:\\d{2}:\\d{2}(?:[.,]\\d{1,9})?(?:Z|[+-]\\d{2}:?\\d{2})?";

    /** Standard application log: timestamp, level and message. */
    public static final Pattern LOG_PATTERN = Pattern.compile(
            "^(" + TIMESTAMP_PATTERN + ")\\s+(TRACE|DEBUG|INFO|WARN|ERROR|FATAL|UNKNOWN)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE
    );

    /**
     * Default Spring Boot console format. Group 3 deliberately contains only
     * the application message; PID, thread and logger are format metadata.
     */
    public static final Pattern SPRING_BOOT_LOG_PATTERN = Pattern.compile(
            "^(" + TIMESTAMP_PATTERN + ")\\s+(TRACE|DEBUG|INFO|WARN|ERROR|FATAL)\\s+\\d+\\s+---\\s+\\[[^]]+]\\s+.+?\\s*:\\s*(.*)$",
            Pattern.CASE_INSENSITIVE
    );

    /** Timestamped line with an application-specific, unknown level token. */
    public static final Pattern UNKNOWN_LEVEL_PATTERN = Pattern.compile(
            "^(" + TIMESTAMP_PATTERN + ")\\s+(\\S+)\\s+(.+)$",
            Pattern.CASE_INSENSITIVE
    );

    /** Lines that belong to the exception emitted by the preceding log entry. */
    public static final Pattern EXCEPTION_CONTINUATION_PATTERN = Pattern.compile(
            "^\\s*(?:" +
                    "at\\s+.+|" +
                    "Caused by:\\s*.+|" +
                    "Suppressed:\\s*.+|" +
                    "\\.\\.\\.\\s+\\d+\\s+more|" +
                    "(?:[\\w$]+\\.)+[\\w$]*(?:Exception|Error)(?::.*)?|" +
                    "SQL(?:State| Error)\\s*:.*|" +
                    "Hibernate\\s*:.*" +
                    ")\\s*$",
            Pattern.CASE_INSENSITIVE
    );

    private LogPatternUtil() {
        throw new UnsupportedOperationException("LogPatternUtil is a utility class");
    }
}
