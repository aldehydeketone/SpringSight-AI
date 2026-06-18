package com.mihir.springsightai.log.controller;

import com.mihir.springsightai.common.ApiResponse;
import com.mihir.springsightai.log.dto.LogFileResponse;
import com.mihir.springsightai.log.service.LogFileService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;

/**
 * REST controller for log file upload operations.
 * All endpoints require JWT authentication (enforced by SecurityConfig).
 */
@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Log Upload", description = "Secure log upload APIs")
public class LogFileController {

    private final LogFileService logFileService;

    /**
     * Uploads a log file (.log or .txt).
     * Validates file type, stores to disk, and persists metadata.
     *
     * @param file the multipart file uploaded by the client
     * @return ApiResponse wrapping the LogFileResponse DTO
     */
    @PostMapping("/upload")
    @Operation(summary = "Upload a log file")
    public ResponseEntity<ApiResponse<LogFileResponse>> uploadLogFile(
            @RequestParam("file") MultipartFile file) throws IOException {

        log.info("[LogFileController] Upload request received: {}", file.getOriginalFilename());

        LogFileResponse logFileResponse = logFileService.uploadLogFile(file);

        ApiResponse<LogFileResponse> response = ApiResponse.<LogFileResponse>builder()
                .success(true)
                .message("File uploaded successfully")
                .data(logFileResponse)
                .build();

        return new ResponseEntity<>(response, HttpStatus.OK);
    }
}
