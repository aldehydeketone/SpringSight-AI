package com.mihir.springsightai.auth.controller;

import com.mihir.springsightai.auth.dto.AuthResponse;
import com.mihir.springsightai.auth.dto.LoginRequest;
import com.mihir.springsightai.auth.dto.RegisterRequest;
import com.mihir.springsightai.auth.service.AuthService;
import com.mihir.springsightai.common.ApiResponse;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller class providing authentication end points.
 * Mapped to /api/auth.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {

    private final AuthService authService;

    /**
     * Endpoint for user registration.
     * Mapped to POST /api/auth/register.
     * Returns 201 Created on success.
     */
    @PostMapping("/register")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .message("User registered successfully")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    /**
     * Endpoint for user login.
     * Mapped to POST /api/auth/login.
     * Returns 200 OK on success.
     */
    @PostMapping("/login")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .message("Login successful")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}
