package com.mihir.springsightai.exception;

/**
 * Thrown when an uploaded file has an unsupported extension.
 * Caught by GlobalExceptionHandler and returned as 400 BAD_REQUEST.
 */
public class InvalidFileTypeException extends RuntimeException {

    public InvalidFileTypeException(String message) {
        super(message);
    }
}
