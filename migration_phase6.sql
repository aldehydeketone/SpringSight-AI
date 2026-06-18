-- Phase 6: Analysis Report Persistence and History Management
CREATE TABLE IF NOT EXISTS analysis_reports (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    filename VARCHAR(255) NOT NULL,
    total_logs INT NOT NULL,
    error_count INT NOT NULL,
    warn_count INT NOT NULL,
    info_count INT NOT NULL,
    root_cause TEXT NOT NULL,
    severity VARCHAR(20) NOT NULL,
    impact TEXT NOT NULL,
    recommended_fix TEXT NOT NULL,
    prevention_steps TEXT NOT NULL,
    confidence VARCHAR(20) NOT NULL,
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    user_id BIGINT NOT NULL,
    CONSTRAINT fk_analysis_reports_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    INDEX idx_analysis_reports_user_created (user_id, created_at),
    INDEX idx_analysis_reports_user_severity (user_id, severity)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
