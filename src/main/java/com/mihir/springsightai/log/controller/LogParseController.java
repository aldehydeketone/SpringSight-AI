package com.mihir.springsightai.log.controller;

import com.mihir.springsightai.log.dto.ParseResponse;
import com.mihir.springsightai.log.service.LogParserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * REST controller that exposes the log parsing endpoint.
 *
 * <p>All endpoints are JWT-protected via the global
 * {@code .anyRequest().authenticated()} rule in {@code SecurityConfig}.
 *
 * <p><b>Endpoint:</b>
 * <pre>
 *   POST /api/logs/{id}/parse
 * </pre>
 */
@Slf4j
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Log Parsing", description = "Parse uploaded logs into structured entries")
public class LogParseController {

    private final LogParserService logParserService;

    /**
     * Triggers parsing of the log file identified by {@code id}.
     *
     * <p>Delegates all business logic to {@link LogParserService#parseLogFile(Long)}.
     * Error cases (file not found, unsupported format) are handled globally by
     * {@code GlobalExceptionHandler} and never surface raw exceptions to callers.
     *
     * @param id the primary key of the {@code LogFile} record to parse
     * @return {@link ParseResponse} containing parse statistics wrapped in 200 OK
     */
    @PostMapping("/{id}/parse")
    @Operation(summary = "Parse an uploaded log file")
    public ResponseEntity<ParseResponse> parseLogFile(@PathVariable Long id) {
        log.info("[LogParseController] Parse request received for logFileId={}", id);
        ParseResponse response = logParserService.parseLogFile(id);
        return ResponseEntity.ok(response);
    }
}
