package com.mihir.springsightai.log.entity;

import jakarta.persistence.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * JPA Entity representing the 'log_files' table.
 * Stores metadata about each uploaded log file.
 * The actual file content is stored on disk; this entity holds the reference path.
 */
@Entity
@Table(name = "log_files")
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogFile {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    /** Original filename as provided by the uploader (e.g., "application.log") */
    @Column(name = "file_name", nullable = false)
    private String fileName;

    /** UUID-prefixed name used to store the file on disk — avoids name collisions */
    @Column(name = "stored_file_name", nullable = false, unique = true)
    private String storedFileName;

    /** File size in bytes */
    @Column(name = "file_size", nullable = false)
    private Long fileSize;

    /** MIME type or detected content type (e.g., "text/plain") */
    @Column(name = "file_type", nullable = false)
    private String fileType;

    /** Absolute or relative path where the file is stored on disk */
    @Column(name = "file_path", nullable = false)
    private String filePath;

    /** Timestamp of when the file was uploaded */
    @Column(name = "uploaded_at", nullable = false, updatable = false)
    private LocalDateTime uploadedAt;

    /** Foreign key reference to the user who uploaded this file */
    @Column(name = "uploaded_by_user_id", nullable = false)
    private Long uploadedByUserId;

    /** Automatically set the upload timestamp before persisting */
    @PrePersist
    protected void onCreate() {
        this.uploadedAt = LocalDateTime.now();
    }
}
