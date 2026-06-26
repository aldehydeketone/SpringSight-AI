package com.mihir.springsightai.auth.service;

import com.mihir.springsightai.auth.dto.AuthResponse;
import com.mihir.springsightai.auth.dto.ForgotPasswordRequest;
import com.mihir.springsightai.auth.dto.LoginRequest;
import com.mihir.springsightai.auth.dto.RegisterRequest;
import com.mihir.springsightai.auth.dto.ResetPasswordRequest;
import com.mihir.springsightai.auth.dto.UserDTO;
import com.mihir.springsightai.auth.entity.EmailVerificationToken;
import com.mihir.springsightai.auth.entity.PasswordResetToken;
import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.auth.repository.EmailVerificationTokenRepository;
import com.mihir.springsightai.auth.repository.PasswordResetTokenRepository;
import com.mihir.springsightai.auth.repository.UserRepository;
import com.mihir.springsightai.exception.EmailAlreadyExistsException;
import com.mihir.springsightai.exception.EmailNotVerifiedException;
import com.mihir.springsightai.exception.InvalidTokenException;
import com.mihir.springsightai.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Core authentication service.
 *
 * <p>Handles registration (with email verification), login (with optional verification gate),
 * forgot-password, and reset-password flows.</p>
 */
@Service
@RequiredArgsConstructor
@Transactional
public class AuthService {

    private final UserRepository userRepository;
    private final EmailVerificationTokenRepository emailVerificationTokenRepository;
    private final PasswordResetTokenRepository passwordResetTokenRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;
    private final EmailService emailService;

    /**
     * When true, login is blocked until the user verifies their email.
     * Defaults to false so existing tests and the default developer setup are unaffected.
     * Set AUTH_REQUIRE_EMAIL_VERIFICATION=true in production to enforce the gate.
     */
    @Value("${auth.require-email-verification:false}")
    private boolean requireEmailVerification;

    // ─────────────────────────────────────────────────────────────────────────────
    // Registration
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Creates a new user account, sends an email verification link, and returns a JWT.
     *
     * <p>The JWT is returned immediately so existing sign-up flows that auto-login after
     * registration continue to work. The {@code emailVerified} flag controls whether the
     * login endpoint will later require verification before issuing fresh tokens.</p>
     */
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email " + request.getEmail() + " is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .emailVerified(false)
                .build();

        User savedUser = userRepository.save(user);

        // Issue and persist a 24-hour verification token, send asynchronously (best-effort)
        issueVerificationToken(savedUser);

        String jwtToken = jwtUtil.generateToken(savedUser);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(toUserDTO(savedUser))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Login
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Validates credentials and issues a JWT.
     * When {@code auth.require-email-verification=true} (production), unverified users receive 403.
     */
    public AuthResponse login(LoginRequest request) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        if (requireEmailVerification && !user.isEmailVerified()) {
            throw new EmailNotVerifiedException(
                    "Please verify your email address before signing in. Check your inbox for a verification link."
            );
        }

        String jwtToken = jwtUtil.generateToken(user);
        return AuthResponse.builder()
                .token(jwtToken)
                .user(toUserDTO(user))
                .build();
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Email Verification
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Activates a user account by consuming a valid verification token.
     * Prevents double-use and honours the 24-hour expiry window.
     */
    public void verifyEmail(String token) {
        EmailVerificationToken verificationToken = emailVerificationTokenRepository.findByToken(token)
                .orElseThrow(() -> new InvalidTokenException("Email verification link is invalid or has expired."));

        if (verificationToken.isUsed()) {
            throw new InvalidTokenException("This verification link has already been used.");
        }

        if (verificationToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Email verification link has expired. Please register again.");
        }

        User user = verificationToken.getUser();
        user.setEmailVerified(true);
        verificationToken.setUsed(true);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Forgot / Reset Password
    // ─────────────────────────────────────────────────────────────────────────────

    /**
     * Generates a 15-minute password reset token and sends it by email.
     * Does not reveal whether the email address exists (prevents user enumeration).
     */
    public void forgotPassword(ForgotPasswordRequest request) {
        userRepository.findByEmail(request.getEmail()).ifPresent(user -> {
            PasswordResetToken resetToken = PasswordResetToken.builder()
                    .token(UUID.randomUUID().toString())
                    .user(user)
                    .expiryDate(LocalDateTime.now().plusMinutes(15))
                    .used(false)
                    .build();
            passwordResetTokenRepository.save(resetToken);
            emailService.sendPasswordResetEmail(user.getEmail(), resetToken.getToken());
        });
    }

    /**
     * Validates a reset token then updates the user's password.
     * The token is immediately marked as used to prevent replay attacks.
     */
    public void resetPassword(ResetPasswordRequest request) {
        PasswordResetToken resetToken = passwordResetTokenRepository.findByToken(request.getToken())
                .orElseThrow(() -> new InvalidTokenException("Password reset link is invalid or has expired."));

        if (resetToken.isUsed()) {
            throw new InvalidTokenException("This password reset link has already been used.");
        }

        if (resetToken.getExpiryDate().isBefore(LocalDateTime.now())) {
            throw new InvalidTokenException("Password reset link has expired. Please request a new one.");
        }

        resetToken.getUser().setPassword(passwordEncoder.encode(request.getNewPassword()));
        resetToken.setUsed(true);
    }

    // ─────────────────────────────────────────────────────────────────────────────
    // Helpers
    // ─────────────────────────────────────────────────────────────────────────────

    private void issueVerificationToken(User user) {
        // Remove any stale token for this user before issuing a fresh one
        emailVerificationTokenRepository.findByUser(user).ifPresent(emailVerificationTokenRepository::delete);

        EmailVerificationToken token = EmailVerificationToken.builder()
                .token(UUID.randomUUID().toString())
                .user(user)
                .expiryDate(LocalDateTime.now().plusHours(24))
                .used(false)
                .build();
        emailVerificationTokenRepository.save(token);
        emailService.sendVerificationEmail(user.getEmail(), token.getToken());
    }

    private UserDTO toUserDTO(User user) {
        return UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();
    }
}
