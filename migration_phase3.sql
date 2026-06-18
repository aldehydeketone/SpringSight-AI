-- Database Migration SQL for Phase 3: Log Parsing Engine
-- Creates the parsed_logs table and establishes foreign key relationship with log_files

CREATE TABLE IF NOT EXISTS parsed_logs (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    log_file_id BIGINT NOT NULL,
    timestamp DATETIME NULL,
    log_level VARCHAR(20) NULL,
    message TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_parsed_logs_log_file_id FOREIGN KEY (log_file_id) REFERENCES log_files(id) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- Add index on log_file_id for optimizing search queries by log file
CREATE INDEX idx_parsed_logs_log_file_id ON parsed_logs(log_file_id);
