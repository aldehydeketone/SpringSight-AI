package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO returned after a successful log file parse operation.
 *
 * <p>Contains statistics about the parsing run rather than raw parsed data,
 * keeping the response lightweight regardless of file size.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ParseResponse {

    /** Whether the parse operation completed without fatal errors. */
    private boolean success;

    /** The ID of the {@code LogFile} record that was parsed. */
    private Long fileId;

    /** Total number of lines read from the file (including blank and unparseable lines). */
    private int totalLines;

    /** Number of lines successfully parsed and saved as {@code ParsedLog} entries. */
    private int parsedEntries;

    /**
     * Number of lines that were skipped — either blank, stack-trace continuations,
     * comment lines, or lines that did not match any supported log pattern.
     */
    private int ignoredLines;
}
