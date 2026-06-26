package com.mihir.springsightai.log.repository;

import com.mihir.springsightai.log.entity.ParsedLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

/**
 * Spring Data JPA repository for the {@link ParsedLog} entity.
 *
 * <p>Provides standard CRUD operations inherited from {@link JpaRepository}
 * plus domain-specific query methods for querying by parent log file.
 */
@Repository
public interface ParsedLogRepository extends JpaRepository<ParsedLog, Long> {

    /**
     * Retrieve all parsed log entries that belong to a specific uploaded log file.
     *
     * @param logFileId the ID of the parent {@code LogFile}
     * @return list of parsed log entries ordered by insertion order (by ID ascending by default)
     */
    List<ParsedLog> findByLogFileId(Long logFileId);

    /**
     * Count how many parsed log entries exist for a given log file.
     * Useful for statistics and pagination without fetching all records.
     *
     * @param logFileId the ID of the parent {@code LogFile}
     * @return total number of parsed entries for that file
     */
    long countByLogFileId(Long logFileId);

    /**
     * Delete all parsed log entries belonging to a specific log file.
     * Used to clean up old parsed data before re-parsing to prevent duplicate entries.
     *
     * @param logFileId the ID of the parent {@code LogFile}
     */
    @org.springframework.data.jpa.repository.Modifying
    @org.springframework.data.jpa.repository.Query("DELETE FROM ParsedLog p WHERE p.logFileId = :logFileId")
    void deleteByLogFileId(Long logFileId);

    /**
     * Retrieve only the parsed log entries matching specific log levels for a given file.
     * Used by the AI context builder to fetch ERROR/WARN entries without loading INFO/DEBUG noise.
     *
     * @param logFileId the ID of the parent {@code LogFile}
     * @param levels    list of log level strings to include (e.g. ["ERROR", "WARN"])
     * @return filtered list of matching parsed log entries
     */
    List<ParsedLog> findByLogFileIdAndLogLevelIn(Long logFileId, List<String> levels);
}
