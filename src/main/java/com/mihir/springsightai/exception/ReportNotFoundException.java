package com.mihir.springsightai.exception;

public class ReportNotFoundException extends RuntimeException {
    public ReportNotFoundException(Long reportId) {
        super("Analysis report not found with id: " + reportId);
    }
}
