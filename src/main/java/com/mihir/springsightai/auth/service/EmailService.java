package com.mihir.springsightai.auth.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.HashMap;
import java.util.Map;

/**
 * Handles all outgoing transactional emails.
 * Supports Resend HTTP API (works seamlessly on cloud platforms like Render where SMTP ports are blocked)
 * as well as standard JavaMailSender SMTP fallback.
 */
@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final org.springframework.beans.factory.ObjectProvider<JavaMailSender> mailSenderProvider;
    private final ObjectMapper objectMapper = new ObjectMapper();
    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(10))
            .build();

    @Value("${app.frontend-base-url:http://localhost:3000}")
    private String frontendBaseUrl;

    @Value("${spring.mail.username:noreply@springsight.app}")
    private String fromEmail;

    @Value("${RESEND_API_KEY:}")
    private String resendApiKey;

    /**
     * Sends an email verification link to a newly registered user.
     */
    @Async
    public void sendVerificationEmail(String to, String token) {
        String link = frontendBaseUrl + "/verify-email?token=" + token;
        String subject = "Verify your SpringSight account";
        String body = """
                Welcome to SpringSight!

                Click the link below to verify your email address and activate your account:

                %s

                This link expires in 24 hours.

                If you did not create this account, you can safely ignore this email.
                """.formatted(link);

        sendEmail(to, subject, body);
    }

    /**
     * Sends a password reset link.
     */
    @Async
    public void sendPasswordResetEmail(String to, String token) {
        String link = frontendBaseUrl + "/reset-password?token=" + token;
        String subject = "Reset your SpringSight password";
        String body = """
                A password reset was requested for your SpringSight account.

                Click the link below to choose a new password:

                %s

                This link expires in 15 minutes and can only be used once.

                If you did not request a password reset, you can safely ignore this email.
                """.formatted(link);

        sendEmail(to, subject, body);
    }

    private void sendEmail(String to, String subject, String text) {
        // Priority 1: Use Resend HTTP API if key is configured (Bypasses SMTP port blocks)
        if (resendApiKey != null && !resendApiKey.isBlank()) {
            try {
                Map<String, Object> payload = new HashMap<>();
                payload.put("from", "SpringSight AI <onboarding@resend.dev>");
                payload.put("to", new String[]{to});
                payload.put("subject", subject);
                payload.put("text", text);

                String jsonPayload = objectMapper.writeValueAsString(payload);

                HttpRequest request = HttpRequest.newBuilder()
                        .uri(URI.create("https://api.resend.com/emails"))
                        .header("Authorization", "Bearer " + resendApiKey.trim())
                        .header("Content-Type", "application/json")
                        .timeout(Duration.ofSeconds(15))
                        .POST(HttpRequest.BodyPublishers.ofString(jsonPayload))
                        .build();

                HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
                if (response.statusCode() >= 200 && response.statusCode() < 300) {
                    log.info("[EmailService] Email sent via Resend API to {}: status={}", to, response.statusCode());
                    return;
                } else {
                    log.error("[EmailService] Resend API error sending email to {}: status={}, body={}", to, response.statusCode(), response.body());
                }
            } catch (Exception e) {
                log.error("[EmailService] Failed to send email via Resend API to {} — {}", to, e.getMessage(), e);
            }
        }

        // Priority 2: Fallback to JavaMailSender (SMTP)
        try {
            JavaMailSender mailSender = mailSenderProvider.getIfAvailable();
            if (mailSender == null) {
                log.warn("[EmailService] JavaMailSender is not configured. Email to {} could not be sent (mock delivery).", to);
                return;
            }
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject(subject);
            message.setText(text);
            mailSender.send(message);
            log.info("[EmailService] Email sent via SMTP to {}", to);
        } catch (Exception ex) {
            log.error("[EmailService] Failed to send email via SMTP to {} — {}", to, ex.getMessage());
        }
    }
}
