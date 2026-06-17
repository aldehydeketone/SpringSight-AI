package com.mihir.springsightai.controller;

import com.mihir.springsightai.common.ApiResponse;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller to expose a protected dummy endpoint for verifying JWT security filter configuration.
 */
@RestController
@RequestMapping("/api/test")
public class TestController {

    @GetMapping("/protected")
    public ResponseEntity<ApiResponse<String>> getProtectedRoute() {
        ApiResponse<String> response = ApiResponse.<String>builder()
                .success(true)
                .data("Access Granted: You have a valid JWT token!")
                .message("Operation successful")
                .build();
        return ResponseEntity.ok(response);
    }
}
