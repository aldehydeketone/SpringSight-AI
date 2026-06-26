package com.mihir.springsightai.auth.controller;

import com.mihir.springsightai.auth.dto.AuthResponse;
import com.mihir.springsightai.auth.dto.ForgotPasswordRequest;
import com.mihir.springsightai.auth.dto.LoginRequest;
import com.mihir.springsightai.auth.dto.RegisterRequest;
import com.mihir.springsightai.auth.dto.ResetPasswordRequest;
import com.mihir.springsightai.auth.service.AuthService;
import com.mihir.springsightai.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

/**
 * Controller exposing authentication endpoints under /api/auth.
 */
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Register, login, email verification, and password reset APIs")
public class AuthController {

    private final AuthService authService;

    // ── Registration ────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/register
     * Creates a new account, sends a verification email, and returns a JWT.
     */
    @PostMapping("/register")
    @Operation(summary = "Register a new user account")
    public ResponseEntity<ApiResponse<AuthResponse>> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse authResponse = authService.register(request);
        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .message("User registered successfully. Please check your email to verify your account.")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.CREATED);
    }

    // ── Login ────────────────────────────────────────────────────────────────────

    /**
     * POST /api/auth/login
     * Validates credentials and returns a JWT.
     * Returns 403 if email verification is enforced and the account is unverified.
     */
    @PostMapping("/login")
    @Operation(summary = "Login and receive a JWT token")
    public ResponseEntity<ApiResponse<AuthResponse>> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse authResponse = authService.login(request);
        ApiResponse<AuthResponse> apiResponse = ApiResponse.<AuthResponse>builder()
                .success(true)
                .data(authResponse)
                .message("Login successful")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    // ── Email Verification ───────────────────────────────────────────────────────

    /**
     * GET /api/auth/verify-email?token=xxx
     * Activates the user account associated with the one-time verification token.
     */
    @GetMapping("/verify-email")
    @Operation(summary = "Verify email address using a one-time token")
    public ResponseEntity<ApiResponse<Void>> verifyEmail(@RequestParam String token) {
        authService.verifyEmail(token);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Email verified successfully. You can now sign in.")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    // ── Forgot Password ──────────────────────────────────────────────────────────

    /**
     * POST /api/auth/forgot-password
     * Sends a password reset link to the email if an account exists.
     * Always responds with 200 to avoid leaking whether the address is registered.
     */
    @PostMapping("/forgot-password")
    @Operation(summary = "Request a password reset email")
    public ResponseEntity<ApiResponse<Void>> forgotPassword(@Valid @RequestBody ForgotPasswordRequest request) {
        authService.forgotPassword(request);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("If an account exists for this email, a password reset link has been sent.")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }

    // ── Reset Password ───────────────────────────────────────────────────────────

    /**
     * POST /api/auth/reset-password
     * Sets a new password using the one-time reset token from the email link.
     */
    @PostMapping("/reset-password")
    @Operation(summary = "Reset password using the one-time token")
    public ResponseEntity<ApiResponse<Void>> resetPassword(@Valid @RequestBody ResetPasswordRequest request) {
        authService.resetPassword(request);
        ApiResponse<Void> apiResponse = ApiResponse.<Void>builder()
                .success(true)
                .message("Password reset successfully. You can now sign in with your new password.")
                .build();
        return new ResponseEntity<>(apiResponse, HttpStatus.OK);
    }
}
