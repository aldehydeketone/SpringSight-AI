package com.mihir.springsightai.exception;

/**
 * Thrown when a {@code LogFile} record cannot be found by the given ID.
 * Caught by {@link GlobalExceptionHandler} and returned as {@code 404 NOT FOUND}.
 */
public class LogFileNotFoundException extends RuntimeException {

    public LogFileNotFoundException(String message) {
        super(message);
    }

    public LogFileNotFoundException(Long id) {
        super("Log file not found with id: " + id);
    }
}
