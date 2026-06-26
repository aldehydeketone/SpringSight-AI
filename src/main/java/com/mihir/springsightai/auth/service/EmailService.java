package com.mihir.springsightai.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

/**
 * Handles all outgoing transactional emails.
 *
 * <p>Email delivery is fire-and-forget: failures are logged but never propagate to the caller.
 * This ensures a misconfigured SMTP server does not break registration or password reset flows
 * during development or when environment variables are absent.</p>
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider;

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${spring.mail.username:noreply@springsight.app}")
    private String fromEmail;

    /**
     * Sends an email verification link to a newly registered user.
     * The link points to the frontend /verify-email route with the one-time token.
     */
    @Async
    public void sendVerificationEmail(String to, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) {
                log.warn("[EmailService] JavaMailSender is not configured. Email to {} could not be sent (mock delivery).", to);
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Verify your SpringSight account");
            message.setText("""
                    Welcome to SpringSight!

                    Click the link below to verify your email address and activate your account:

                    %s

                    This link expires in 24 hours.

                    If you did not create this account, you can safely ignore this email.
                    """.formatted(link));
            mailSender.send(message);
            log.info("[EmailService] Verification email sent to {}", to);
        } catch (Exception ex) {
            log.error("[EmailService] Failed to send verification email to {} — {}", to, ex.getMessage());
        }
    }

    /**
     * Sends a password reset link.
     * The link points to the frontend /reset-password route with the one-time token.
     */
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) {
                log.warn("[EmailService] JavaMailSender is not configured. Email to {} could not be sent (mock delivery).", to);
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Reset your SpringSight password");
            message.setText("""
                    A password reset was requested for your SpringSight account.

                    Click the link below to choose a new password:

                    %s

                    This link expires in 15 minutes and can only be used once.

                    If you did not request a password reset, you can safely ignore this email.
                    """.formatted(link));
            mailSender.send(message);
            log.info("[EmailService] Password reset email sent to {}", to);
        } catch (Exception ex) {
            log.error("[EmailService] Failed to send password reset email to {} — {}", to, ex.getMessage());
        }
    }
}
