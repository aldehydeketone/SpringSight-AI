package com.mihir.springsightai.log.repository;

import com.mihir.springsightai.log.entity.LogFile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for LogFile entity.
 * Provides standard CRUD operations and custom queries against the log_files table.
 */
@Repository
public interface LogFileRepository extends JpaRepository<LogFile, Long> {

    /** Find all log files uploaded by a specific user */
    List<LogFile> findByUploadedByUserId(Long userId);
}
