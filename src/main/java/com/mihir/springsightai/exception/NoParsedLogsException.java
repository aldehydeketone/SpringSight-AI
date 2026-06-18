package com.mihir.springsightai.exception;

/**
 * Thrown when an analysis is requested on a log file that has no parsed logs.
 * Caught by {@link GlobalExceptionHandler} and returned as {@code 400 BAD REQUEST}.
 */
public class NoParsedLogsException extends RuntimeException {
    public NoParsedLogsException(String message) {
        super(message);
    }
}
