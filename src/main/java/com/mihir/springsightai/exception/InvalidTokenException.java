package com.mihir.springsightai.exception;

/**
 * Thrown when an email verification or password reset token is invalid, expired, or already used.
 */
public class InvalidTokenException extends RuntimeException {

    public InvalidTokenException(String message) {
        super(message);
    }
}
