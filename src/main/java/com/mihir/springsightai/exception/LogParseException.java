package com.mihir.springsightai.exception;

/**
 * Thrown when a log file is found but its contents cannot be parsed into
 * structured log entries (e.g. zero parseable lines, unsupported format).
 * Caught by {@link GlobalExceptionHandler} and returned as {@code 400 BAD REQUEST}.
 */
public class LogParseException extends RuntimeException {

    public LogParseException(String message) {
        super(message);
    }

    public LogParseException(String message, Throwable cause) {
        super(message, cause);
    }
}
