package com.mihir.springsightai.exception;

public class UnauthorizedReportAccessException extends RuntimeException {
    public UnauthorizedReportAccessException(Long reportId) {
        super("You are not authorized to access analysis report: " + reportId);
    }
}
