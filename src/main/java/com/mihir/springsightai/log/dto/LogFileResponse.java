package com.mihir.springsightai.log.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

/**
 * Response DTO returned after a successful log file upload.
 * Only exposes safe metadata — never the full entity or the disk path.
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class LogFileResponse {

    /** Database ID of the saved log file record */
    private Long id;

    /** Original filename as uploaded by the user */
    private String fileName;

    /** File size in bytes */
    private Long fileSize;

    /** MIME type or file type string */
    private String fileType;
}
