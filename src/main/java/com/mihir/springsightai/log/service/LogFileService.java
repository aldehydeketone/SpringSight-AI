package com.mihir.springsightai.log.service;

import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.exception.InvalidFileTypeException;
import com.mihir.springsightai.log.dto.LogFileResponse;
import com.mihir.springsightai.log.entity.LogFile;
import com.mihir.springsightai.log.repository.LogFileRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.nio.file.StandardCopyOption;
import java.util.List;
import java.util.UUID;

/**
 * Service class handling all log file upload business logic.
 * Validates file type, stores file to disk, and persists metadata to the database.
 */
@Slf4j
@Service
@RequiredArgsConstructor
public class LogFileService {

    private final LogFileRepository logFileRepository;

    /** Allowed file extensions for log uploads */
    private static final List<String> ALLOWED_EXTENSIONS = List.of(".log", ".txt");

    /** Upload directory path — configured in application.properties */
    @Value("${file.upload-dir}")
    private String uploadDir;

    /**
     * Validates, stores, and records a log file upload.
     *
     * @param file the multipart file from the HTTP request
     * @return LogFileResponse DTO with saved record metadata
     * @throws InvalidFileTypeException if the file extension is not allowed
     * @throws IOException if writing to disk fails
     */
    @Transactional
    public LogFileResponse uploadLogFile(MultipartFile file) throws IOException {

        // 1. Validate that the file is not empty
        if (file.isEmpty()) {
            throw new InvalidFileTypeException("Uploaded file must not be empty");
        }

        // 2. Extract and validate file extension
        String originalFileName = file.getOriginalFilename();
        String extension = getFileExtension(originalFileName);

        if (!ALLOWED_EXTENSIONS.contains(extension.toLowerCase())) {
            throw new InvalidFileTypeException(
                "File type '" + extension + "' is not allowed. Permitted types: " + ALLOWED_EXTENSIONS
            );
        }

        // 3. Generate a UUID-prefixed stored filename to prevent name collisions on disk
        String storedFileName = UUID.randomUUID() + "_" + originalFileName;

        // 4. Resolve the upload directory and create it if it doesn't exist
        Path uploadPath = Paths.get(uploadDir).toAbsolutePath().normalize();
        Files.createDirectories(uploadPath);

        // 5. Write the file to disk
        Path targetPath = uploadPath.resolve(storedFileName);
        Files.copy(file.getInputStream(), targetPath, StandardCopyOption.REPLACE_EXISTING);
        log.info("[LogFileService] File saved to disk: {}", targetPath);

        // 6. Retrieve the authenticated user's ID from the SecurityContext
        Long uploadedByUserId = getAuthenticatedUserId();

        // 7. Build and persist the LogFile metadata record
        LogFile logFile = LogFile.builder()
                .fileName(originalFileName)
                .storedFileName(storedFileName)
                .fileSize(file.getSize())
                .fileType(file.getContentType() != null ? file.getContentType() : "text/plain")
                .filePath(targetPath.toString())
                .uploadedByUserId(uploadedByUserId)
                .build();

        LogFile savedLogFile = logFileRepository.save(logFile);
        log.info("[LogFileService] LogFile record saved with ID: {}", savedLogFile.getId());

        // 8. Map to DTO and return
        return LogFileResponse.builder()
                .id(savedLogFile.getId())
                .fileName(savedLogFile.getFileName())
                .fileSize(savedLogFile.getFileSize())
                .fileType(savedLogFile.getFileType())
                .build();
    }

    /**
     * Extracts the file extension from the filename including the dot (e.g., ".log").
     * Returns empty string if no extension is found.
     */
    private String getFileExtension(String filename) {
        if (filename == null || !filename.contains(".")) {
            return "";
        }
        return filename.substring(filename.lastIndexOf('.'));
    }

    /**
     * Reads the authenticated user's ID from Spring Security's SecurityContext.
     * This works because JwtAuthFilter populates the SecurityContext for every
     * valid JWT request before the controller is reached.
     */
    private Long getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        User user = (User) authentication.getPrincipal();
        return user.getId();
    }
}
