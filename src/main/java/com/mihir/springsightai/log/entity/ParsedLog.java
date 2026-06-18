package com.mihir.springsightai.log.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity representing one parsed log entry stored in the {@code parsed_logs} table.
 *
 * <p>Each record corresponds to a single line that was successfully extracted
 * from an uploaded log file. Lines that could not be parsed are not stored.
 *
 * <p>Relationship: many {@code ParsedLog} entries belong to one {@link LogFile}.
 */
@Entity
@Table(name = "parsed_logs", indexes = {
        @Index(name = "idx_parsed_logs_log_file_id", columnList = "log_file_id")
})
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParsedLog {

    /** Auto-generated primary key. */
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /**
     * Foreign key — the {@link LogFile} this entry was extracted from.
     * Stored as a plain {@code Long} to avoid eager-loading the parent entity
     * during bulk inserts; the FK constraint is declared at the column level.
     */
    @Column(name = "log_file_id", nullable = false)
    private Long logFileId;

    /**
     * The timestamp extracted from the log line (e.g. {@code 2026-06-18 10:15:23}).
     * May be {@code null} if the line matched the fallback pattern but had no
     * parseable date — unlikely in practice given the regex guards.
     */
    @Column(name = "timestamp")
    private LocalDateTime timestamp;

    /**
     * The log level extracted from the line: INFO, WARN, ERROR, DEBUG, or UNKNOWN
     * when the level token does not match any recognised value.
     */
    @Column(name = "log_level", length = 20)
    private String logLevel;

    /**
     * The human-readable message that follows the level token on the log line.
     * Stored as TEXT to accommodate arbitrarily long messages.
     */
    @Column(name = "message", columnDefinition = "TEXT")
    private String message;

    /** Timestamp of when this record was persisted to the database. */
    @Column(name = "created_at", nullable = false, updatable = false)
    private LocalDateTime createdAt;

    /** Automatically set {@code createdAt} before the first persist. */
    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
    }
}
