package com.mihir.springsightai.exception;

public class UnauthorizedLogFileAccessException extends RuntimeException {
    public UnauthorizedLogFileAccessException(Long logFileId) {
        super("You are not authorized to access log file: " + logFileId);
    }
}
