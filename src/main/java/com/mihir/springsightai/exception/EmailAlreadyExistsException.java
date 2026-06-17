package com.mihir.springsightai.exception;

/**
 * Custom runtime exception thrown when a user registration fails due to email conflict.
 */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException(String message) {
        super(message);
    }
}
