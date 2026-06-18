package com.mihir.springsightai.exception;

/**
 * Exception thrown when PDF document generation fails.
 * Maps to HTTP 500 Internal Server Error in GlobalExceptionHandler.
 */
public class PdfGenerationException extends RuntimeException {
    public PdfGenerationException(Long reportId, Throwable cause) {
        super("Failed to generate PDF report for report ID: " + reportId, cause);
    }
}
