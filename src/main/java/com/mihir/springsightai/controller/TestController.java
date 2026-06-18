package com.mihir.springsightai.controller;

import com.mihir.springsightai.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to expose a protected dummy endpoint for verifying JWT security filter configuration.
 */
@RestController
@RequestMapping("/api/test")
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "Security Test", description = "Protected route used to verify JWT configuration")
public class TestController {

    @GetMapping("/protected")
    @Operation(summary = "Verify JWT-protected access")
    public ResponseEntity<ApiResponse<String>> getProtectedRoute() {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .data("Access Granted: You have a valid JWT token!")
                .message("Operation successful")
                .build();
        return ResponseEntity.ok(response);
    }
}
