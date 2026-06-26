package com.mihir.springsightai.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.log.entity.LogFile;
import com.mihir.springsightai.log.repository.LogFileRepository;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.HttpStatusCode;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientRequestException;
import org.springframework.web.reactive.function.client.WebClientResponseException;
import org.springframework.web.util.UriComponentsBuilder;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;

import java.net.SocketTimeoutException;
import java.time.Duration;
import java.time.temporal.ChronoUnit;
import java.util.ArrayList;
import java.util.Comparator;
import java.util.List;
import java.util.Map;
import java.util.Optional;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.regex.Matcher;
import java.util.regex.Pattern;
import java.util.concurrent.TimeoutException;
import java.util.stream.Collectors;

/**
 * Service to interact with Google Gemini API.
 * Uses Gemini 2.5 Flash model via REST API with WebClient.
 * Supports both raw text generation and structured root cause analysis.
 */
@Service
@Slf4j
public class GeminiService {

    private static final String DEFAULT_GEMINI_API_URL =
            "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);
    private static final int MAX_RETRIES = 3;
    private static final long[] RETRY_DELAYS_SECONDS = {2L, 4L, 8L};
    private static final Pattern TECHNICAL_REFERENCE_PATTERN = Pattern.compile(
            "\\b(?:[a-z_][\\w$]*\\.)+[A-Z][\\w$]*(?:Exception|Error|Service|Repository|Controller|Manager|Config|Builder|Client|Factory|Template)?\\b" +
                    "|\\b[A-Za-z_][\\w$]*\\.[A-Za-z_][\\w$]*\\(\\)" +
                    "|\\b[A-Z][A-Za-z0-9_]*Exception\\b" +
                    "|\\b[A-Z][A-Za-z0-9_]*Error\\b" +
                    "|\\b[A-Z][A-Za-z0-9_]*Service\\b" +
                    "|\\b[A-Z][A-Za-z0-9_]*Repository\\b" +
                    "|\\b[A-Z][A-Za-z0-9_]*Controller\\b" +
                    "|\\b[A-Z][A-Za-z0-9_]*Bean\\b" +
                    "|:\\d+"
    );

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;
    private final String geminiApiUrl;
    private final boolean debugReturnRawError;
    private final LogAiContextBuilder contextBuilder;
    private final LogFileRepository logFileRepository;

    @Autowired
    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            @Value("${gemini.api.url:" + DEFAULT_GEMINI_API_URL + "}") String geminiApiUrl,
            @Value("${gemini.debug.return-raw-error:true}") boolean debugReturnRawError,
            ObjectMapper objectMapper,
            LogAiContextBuilder contextBuilder,
            LogFileRepository logFileRepository
    ) {
        this(apiKey, geminiApiUrl, debugReturnRawError, objectMapper, contextBuilder, logFileRepository,
                WebClient.builder().baseUrl(geminiApiUrl).build());
    }

    GeminiService(String apiKey, String geminiApiUrl, boolean debugReturnRawError,
                  ObjectMapper objectMapper, LogAiContextBuilder contextBuilder, LogFileRepository logFileRepository, WebClient webClient) {
        this.apiKey = apiKey;
        this.geminiApiUrl = geminiApiUrl;
        this.debugReturnRawError = debugReturnRawError;
        this.objectMapper = objectMapper;
        this.contextBuilder = contextBuilder;
        this.logFileRepository = logFileRepository;
        this.webClient = webClient;
        log.info("[GeminiService] Initialized with Gemini 2.5 Flash model");
        log.info("[GeminiService] Gemini config loaded. url={}, apiKeyConfigured={}, debugReturnRawError={}",
                geminiApiUrl, isApiKeyConfigured(), debugReturnRawError);
    }

    /** Package-private constructor for unit tests — no context builder needed for non-enriched tests. */
    GeminiService(String apiKey, String geminiApiUrl, ObjectMapper objectMapper, WebClient webClient) {
        this(apiKey, geminiApiUrl, false, objectMapper, null, null, webClient);
    }

    /**
     * Sends a prompt to Gemini API and returns the text response.
     */
    public String generateContent(String prompt) {
        log.info("[GeminiService] generateContent prompt length={}", prompt == null ? 0 : prompt.length());
        return callGeminiApi(prompt);
    }

    /**
     * Generates AI Root Cause Analysis from log analysis data.
     *
     * <p>When {@link AiAnalysisRequest#getLogFileId()} is present and a
     * {@link LogAiContextBuilder} is available, the method fetches detailed
     * {@code ParsedLog} records and builds an enriched prompt. Otherwise it
     * falls back to the summary-only prompt for backward compatibility.
     *
     * @param request the analysis request from the client
     * @return structured AI diagnosis
     */
    public AiAnalysisResponse generateRootCauseAnalysis(AiAnalysisRequest request) {
        log.info("[GeminiService] Starting root cause analysis for file: {}", request.getFilename());

        // Build prompt — enriched path when logFileId is available, summary path otherwise
        String prompt;
        Long resolvedLogFileId = resolveLogFileId(request);
        boolean contextEnabled = contextBuilder != null && resolvedLogFileId != null;
        log.info("[GeminiService] AI Context Builder: {}", contextEnabled ? "ENABLED" : "FALLBACK");
        if (contextEnabled) {
            log.info("[GeminiService] Resolved logFileId={} — building enriched AI context", resolvedLogFileId);
            LogAiContext context = contextBuilder.build(resolvedLogFileId);
            int parsedLogCount = context.errorLogLines().size() + context.warnLogLines().size();
            log.info("[GeminiService] Parsed Logs Used: {}", parsedLogCount);
            log.info("[GeminiService] ERROR count: {}", context.errorLogLines().size());
            log.info("[GeminiService] WARN count: {}", context.warnLogLines().size());
            log.info("[GeminiService] INFO count: {}", Math.max(0, request.getInfoCount()));
            log.info("[GeminiService] Number of log lines sent to Gemini: {}", parsedLogCount + context.stackTraceFragments().size() + context.exceptionFrequency().size());
            if (context.isEmpty()) {
                log.warn("[GeminiService] Enriched context is empty for logFileId={} — falling back to summary prompt",
                        resolvedLogFileId);
                log.info("[GeminiService] AI Context Builder: FALLBACK");
                prompt = PromptBuilder.buildRootCausePrompt(request);
            } else {
                prompt = PromptBuilder.buildRootCausePrompt(request, context);
                log.info("[GeminiService] Enriched prompt built. length={}", prompt.length());
            }
        } else {
            log.info("[GeminiService] AI Context Builder: FALLBACK");
            log.info("[GeminiService] No reliable log evidence could be resolved — using summary-based prompt");
            prompt = PromptBuilder.buildRootCausePrompt(request);
        }

        log.info("[GeminiService] Prompt length={}", prompt.length());
        log.info("[GeminiService] Prompt Length: {}", prompt.length());

        String rawResponse = callGeminiApi(prompt);

        if (rawResponse == null || rawResponse.isBlank()) {
            log.error("[GeminiService] Gemini returned empty response");
            throw new RuntimeException("Gemini API returned empty response");
        }

        // Always log raw Gemini response for debugging
        log.info("[GeminiService] Raw Gemini response: {}", rawResponse);

        String cleanedJson = cleanJsonResponse(rawResponse);
        log.info("[GeminiService] Cleaned JSON response: {}", cleanedJson);

        try {
            AiAnalysisResponse response = objectMapper.readValue(cleanedJson, AiAnalysisResponse.class);
            normalizeResponse(response);
            ValidationResult validationResult = validateAndSanitizeResponse(response, prompt);
            log.info("[GeminiService] Hallucination Validation: {}",
                    validationResult.hallucinated() ? "FAILED" : "PASSED");
            if (validationResult.hallucinated()) {
                log.warn("[GeminiService] Removed {} fabricated references.", validationResult.removedCount());
            }
            if (validationResult.hallucinated()) {
                response = validationResult.sanitizedResponse();
            }
            log.info("[GeminiService] Root cause analysis completed. Severity={}, Confidence={}",
                    response.getSeverity(), response.getConfidence());
            return response;

        } catch (Exception e) {
            log.error("[GeminiService] Failed to parse Gemini response. Raw: {}", rawResponse, e);
            AiAnalysisResponse fallback = buildFallbackResponse(request);
            log.info("[GeminiService] Hallucination Validation: PASSED");
            return fallback;
        }
    }

    /**
     * Normalises all fields of a successfully parsed AI response:
     * trims whitespace, de-duplicates blank lines in recommendedFix,
     * and applies safe defaults for missing mandatory fields.
     */
    private void normalizeResponse(AiAnalysisResponse response) {
        if (response.getRootCause() == null || response.getRootCause().isBlank()) {
            response.setRootCause("Root cause could not be determined from available log evidence.");
        }
        if (response.getRecommendedFix() == null || response.getRecommendedFix().isBlank()) {
            response.setRecommendedFix(
                    "1. Review the full stack trace in the application log.\n" +
                    "2. Confirm all dependent services are reachable and healthy.\n" +
                    "3. Validate application configuration properties.");
        } else {
            // Trim each line and remove blank lines — ensures clean numbered list rendering
            String normalized = java.util.Arrays.stream(response.getRecommendedFix().split("\\n"))
                    .map(String::trim)
                    .filter(line -> !line.isBlank())
                    .collect(Collectors.joining("\n"));
            response.setRecommendedFix(normalized);
        }
        if (response.getSeverity() == null || response.getSeverity().isBlank()) {
            response.setSeverity("MEDIUM");
        }
        if (response.getConfidence() == null || response.getConfidence().isBlank()) {
            response.setConfidence("MEDIUM");
        }
        if (response.getImpact() == null || response.getImpact().isBlank()) {
            response.setImpact("Service degradation. Affected users may experience errors or downtime.");
        }
        if (response.getPreventionSteps() == null || response.getPreventionSteps().isBlank()) {
            response.setPreventionSteps(
                    "Add structured alerting on ERROR-level log patterns and configure health-check monitors.");
        }
    }

    /**
     * Builds a professional fallback response when Gemini fails or returns unparseable output.
     * References detected exception names where available — never fabricates details.
     */
    private AiAnalysisResponse buildFallbackResponse(AiAnalysisRequest request) {
        String rootCause;
        String recommendedFix;

        List<String> topErrors = request.getTopErrors();
        if (topErrors != null && !topErrors.isEmpty()) {
            // Use the most frequent exception name as the anchor for the fallback
            String primaryException = topErrors.get(0);
            rootCause = "The available logs do not contain sufficient evidence to determine the exact root cause.";
            recommendedFix = String.format(
                    "1. Review the stack trace and error messages associated with '%s'.\n" +
                    "2. Validate connectivity to the downstream service or resource implicated by the exception.\n" +
                    "3. Inspect recent deployment or configuration changes related to the detected failure.\n" +
                    "4. Correlate the exception frequency with the timestamps in the log evidence.",
                    primaryException);
        } else {
            rootCause = "The available logs do not contain sufficient evidence to determine the exact root cause.";
            recommendedFix =
                    "1. Review the ERROR-level entries and surrounding context in the log evidence.\n" +
                    "2. Confirm whether the observed exception recurs at the same timestamp window.\n" +
                    "3. Check the health of any downstream dependency explicitly mentioned in the logs.";
        }

        return AiAnalysisResponse.builder()
                .rootCause(rootCause)
                .severity("LOW")
                .impact("The available logs are insufficient to determine the precise incident impact.")
                .recommendedFix(recommendedFix)
                .preventionSteps("Improve log coverage with structured error context and correlate exception timestamps with deployment events.")
                .confidence("LOW")
                .build();
    }

    private Long resolveLogFileId(AiAnalysisRequest request) {
        if (request.getLogFileId() != null) {
            return request.getLogFileId();
        }

        if (logFileRepository == null || request.getFilename() == null || request.getFilename().isBlank()) {
            return null;
        }

        Long authenticatedUserId = getAuthenticatedUserId().orElse(null);
        if (authenticatedUserId == null) {
            return null;
        }

        List<LogFile> matches = logFileRepository.findByUploadedByUserId(authenticatedUserId).stream()
                .filter(file -> file.getFileName() != null && file.getFileName().equalsIgnoreCase(request.getFilename()))
                .sorted(Comparator.comparing(LogFile::getUploadedAt, Comparator.nullsLast(Comparator.reverseOrder()))
                        .thenComparing(LogFile::getId, Comparator.nullsLast(Comparator.reverseOrder())))
                .toList();

        if (matches.isEmpty()) {
            log.info("[GeminiService] No reliable LogFile match found for userId={} and filename='{}'",
                    authenticatedUserId, request.getFilename());
            return null;
        }

        if (matches.size() > 1) {
            log.info("[GeminiService] Multiple LogFile matches found for userId={} and filename='{}'. Using deterministic latest upload id={}",
                    authenticatedUserId, request.getFilename(), matches.get(0).getId());
        }

        Optional<LogFile> bestMatch = matches.stream()
                .findFirst();

        bestMatch.ifPresent(file -> log.info("[GeminiService] Resolved logFileId from filename '{}': {}", request.getFilename(), file.getId()));
        return bestMatch.map(LogFile::getId).orElse(null);
    }

    private Optional<Long> getAuthenticatedUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated()
                || !(authentication.getPrincipal() instanceof User user)) {
            return Optional.empty();
        }
        return Optional.ofNullable(user.getId());
    }

    private ValidationResult validateAndSanitizeResponse(AiAnalysisResponse response, String prompt) {
        Set<String> evidenceItems = extractEvidenceItems(prompt);
        String evidence = prompt == null ? "" : prompt;
        int removed = 0;

        String sanitizedRootCause = sanitizeField(response.getRootCause(), evidenceItems, evidence);
        removed += countRemoved(response.getRootCause(), sanitizedRootCause);
        String sanitizedImpact = sanitizeField(response.getImpact(), evidenceItems, evidence);
        removed += countRemoved(response.getImpact(), sanitizedImpact);
        String sanitizedFix = sanitizeField(response.getRecommendedFix(), evidenceItems, evidence);
        removed += countRemoved(response.getRecommendedFix(), sanitizedFix);
        String sanitizedPrevention = sanitizeField(response.getPreventionSteps(), evidenceItems, evidence);
        removed += countRemoved(response.getPreventionSteps(), sanitizedPrevention);

        if (sanitizedRootCause == null || sanitizedRootCause.isBlank()) {
            sanitizedRootCause = "Cannot be determined from the provided logs.";
        }

        if (!containsEvidenceBasis(sanitizedRootCause, evidence)) {
            sanitizedRootCause = "Cannot be determined from the provided logs.";
        }

        AiAnalysisResponse sanitized = AiAnalysisResponse.builder()
                .rootCause(sanitizedRootCause)
                .severity(response.getSeverity())
                .impact(sanitizedImpact == null || sanitizedImpact.isBlank()
                        ? "Cannot be determined from the provided logs."
                        : sanitizedImpact)
                .recommendedFix(sanitizedFix == null || sanitizedFix.isBlank()
                        ? "1. Review the available log evidence.\n2. Correlate the detected exception with surrounding entries.\n3. Validate any dependency explicitly mentioned in the logs."
                        : sanitizedFix)
                .preventionSteps(sanitizedPrevention == null || sanitizedPrevention.isBlank()
                        ? "Improve log coverage and correlate exception frequency with deployment events."
                        : sanitizedPrevention)
                .confidence(response.getConfidence())
                .build();

        if (removed > 0) {
            sanitized.setConfidence("LOW");
        }

        return new ValidationResult(sanitized, removed > 0, removed);
    }

    private String sanitizeField(String value, Set<String> evidenceItems, String evidenceText) {
        if (value == null || value.isBlank()) {
            return value;
        }

        Matcher matcher = TECHNICAL_REFERENCE_PATTERN.matcher(value);
        StringBuffer sb = new StringBuffer();
        boolean changed = false;
        while (matcher.find()) {
            String match = matcher.group();
            if (evidenceItems.contains(match) || evidenceText.contains(match)) {
                matcher.appendReplacement(sb, Matcher.quoteReplacement(match));
            } else {
                matcher.appendReplacement(sb, Matcher.quoteReplacement("Cannot be determined from the available logs."));
                changed = true;
            }
        }
        matcher.appendTail(sb);
        return changed ? sb.toString() : value;
    }

    private int countRemoved(String original, String sanitized) {
        if (original == null || sanitized == null || original.equals(sanitized)) {
            return 0;
        }
        return 1;
    }

    private boolean containsEvidenceBasis(String value, String evidence) {
        if (value == null || value.isBlank()) {
            return false;
        }
        String lower = value.toLowerCase();
        return lower.contains("cannot be determined from the provided logs")
                || evidence.toLowerCase().contains(extractAnchor(value).toLowerCase());
    }

    private Set<String> extractEvidenceItems(String prompt) {
        if (prompt == null || prompt.isBlank()) {
            return Set.of();
        }

        Set<String> items = new LinkedHashSet<>();
        Matcher matcher = TECHNICAL_REFERENCE_PATTERN.matcher(prompt);
        while (matcher.find()) {
            items.add(matcher.group());
        }
        return items;
    }

    private String extractAnchor(String value) {
        if (value == null) return "";
        String firstSentence = value.split("[\\.!?]", 2)[0];
        return firstSentence.replace("Cannot be determined from the provided logs", "").trim();
    }

    /**
     * Calls the Gemini API with retry handling for transient failures.
     */
    private String callGeminiApi(String prompt) {
        GeminiCallFailure lastFailure = null;

        for (int attempt = 1; attempt <= MAX_RETRIES + 1; attempt++) {
            try {
                return executeGeminiRequest(prompt);
            } catch (GeminiCallFailure failure) {
                lastFailure = failure;

                if (!failure.retryable() || attempt == MAX_RETRIES + 1) {
                    log.error("[GeminiService] Final failure after attempt {}. Status: {}. Reason: {}",
                            attempt, failure.statusLabel(), failure.userMessage());
                    throw new RuntimeException(failure.userMessage(), failure);
                }

                long delaySeconds = RETRY_DELAYS_SECONDS[attempt - 1];
                log.warn("[GeminiService] Retry attempt {} failed. Status: {}. Retrying in {} seconds.",
                        attempt, failure.statusLabel(), delaySeconds);
                sleepQuietly(delaySeconds);
            }
        }

        throw new RuntimeException(lastFailure != null
                ? lastFailure.userMessage()
                : "AI service is temporarily unavailable. Please try again in a few minutes.");
    }

    private String executeGeminiRequest(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.info("[GeminiService] Sending request to Gemini endpoint {}", getMaskedRequestUrl());
            log.debug("[GeminiService] Request payload sent to Gemini: {}", requestJson);
        } catch (Exception ex) {
            log.warn("[GeminiService] Failed to serialize request body for logging", ex);
        }

        try {
            String responseJson = webClient.post()
                    .uri(uriBuilder -> uriBuilder.queryParam("key", apiKey).build())
                    .contentType(MediaType.APPLICATION_JSON)
                    .bodyValue(requestBody)
                    .retrieve()
                    .bodyToMono(String.class)
                    .timeout(REQUEST_TIMEOUT)
                    .block();

            log.info("[GeminiService] Raw JSON response received from Gemini");
            log.debug("[GeminiService] Gemini response body: {}", responseJson);
            return extractTextFromResponse(responseJson);

        } catch (WebClientResponseException e) {
            log.error("[GeminiService] Gemini HTTP error. url={}, status={}, statusText={}, responseBody={}",
                    getMaskedRequestUrl(), e.getStatusCode().value(), e.getStatusText(), e.getResponseBodyAsString(), e);
            throw handleGeminiResponseException(e);
        } catch (WebClientRequestException e) {
            log.error("[GeminiService] Gemini request failed. url={}, exception={}, message={}",
                    getMaskedRequestUrl(), e.getClass().getSimpleName(), e.getMessage(), e);
            throw handleNetworkFailure(e);
        } catch (RuntimeException e) {
            Throwable timeoutCause = findCause(e, TimeoutException.class, SocketTimeoutException.class);
            if (timeoutCause != null) {
                log.error("[GeminiService] Gemini request timed out. url={}, exception={}, message={}",
                        getMaskedRequestUrl(), e.getClass().getSimpleName(), e.getMessage(), e);
                throw new GeminiCallFailure(true, null,
                        "AI request timed out. Please try again.", timeoutCause);
            }
            log.error("[GeminiService] Unexpected Gemini runtime failure. url={}, exception={}, message={}",
                    getMaskedRequestUrl(), e.getClass().getSimpleName(), e.getMessage(), e);
            throw new GeminiCallFailure(false, null,
                    "AI service request failed. Please try again.", e);
        }
    }

    private GeminiCallFailure handleGeminiResponseException(WebClientResponseException e) {
        HttpStatusCode statusCode = e.getStatusCode();
        int status = statusCode.value();
        String rawMessage = buildRawHttpErrorMessage(e);

        if (status == 503) {
            return new GeminiCallFailure(true, status,
                    debugReturnRawError ? rawMessage : "AI service is temporarily unavailable. Please try again in a few minutes.", e);
        }

        if (status == 429) {
            return new GeminiCallFailure(true, status,
                    debugReturnRawError ? rawMessage : "AI service is currently busy. Please try again shortly.", e);
        }

        if (status == 401 || status == 403) {
            return new GeminiCallFailure(false, status,
                    debugReturnRawError ? rawMessage : "AI service authentication failed. Please check the API key configuration.", e);
        }

        if (status == 400) {
            return new GeminiCallFailure(false, status,
                    debugReturnRawError ? rawMessage : "AI service request was rejected. Please try again.", e);
        }

        return new GeminiCallFailure(false, status,
                debugReturnRawError ? rawMessage : "AI service returned an unexpected error. Please try again later.", e);
    }

    private GeminiCallFailure handleNetworkFailure(WebClientRequestException e) {
        Throwable timeoutCause = findCause(e, TimeoutException.class, SocketTimeoutException.class);
        if (timeoutCause != null) {
            return new GeminiCallFailure(true, null,
                    debugReturnRawError ? buildRawNetworkErrorMessage(e) : "AI request timed out. Please try again.", e);
        }

        return new GeminiCallFailure(true, null,
                debugReturnRawError ? buildRawNetworkErrorMessage(e) : "AI service is temporarily unavailable. Please try again in a few minutes.", e);
    }

    private void sleepQuietly(long delaySeconds) {
        try {
            Thread.sleep(Duration.of(delaySeconds, ChronoUnit.SECONDS).toMillis());
        } catch (InterruptedException interruptedException) {
            Thread.currentThread().interrupt();
            throw new RuntimeException("AI request was interrupted", interruptedException);
        }
    }

    private Throwable findCause(Throwable throwable, Class<? extends Throwable>... types) {
        Throwable current = throwable;
        while (current != null) {
            for (Class<? extends Throwable> type : types) {
                if (type.isInstance(current)) {
                    return current;
                }
            }
            current = current.getCause();
        }
        return null;
    }

    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();

        if (cleaned.startsWith("```json")) {
            cleaned = cleaned.substring(7);
        } else if (cleaned.startsWith("```")) {
            cleaned = cleaned.substring(3);
        }

        if (cleaned.endsWith("```")) {
            cleaned = cleaned.substring(0, cleaned.length() - 3);
        }

        return cleaned.trim();
    }

    private String extractTextFromResponse(String responseJson) {
        try {
            JsonNode root = objectMapper.readTree(responseJson);
            JsonNode candidates = root.path("candidates");

            if (candidates.isArray() && !candidates.isEmpty()) {
                JsonNode firstCandidate = candidates.get(0);
                JsonNode parts = firstCandidate.path("content").path("parts");

                if (parts.isArray() && !parts.isEmpty()) {
                    return parts.get(0).path("text").asText();
                }
            }

            log.warn("[GeminiService] Unexpected response structure returned by Gemini");
            return "No response generated";

        } catch (Exception e) {
            log.error("[GeminiService] Failed to parse Gemini response", e);
            throw new RuntimeException("Failed to parse Gemini API response", e);
        }
    }

    private String buildRawHttpErrorMessage(WebClientResponseException e) {
        String responseBody = e.getResponseBodyAsString();
        StringBuilder builder = new StringBuilder()
                .append("Gemini HTTP ")
                .append(e.getStatusCode().value())
                .append(" ")
                .append(e.getStatusText());

        if (responseBody != null && !responseBody.isBlank()) {
            builder.append(": ").append(responseBody);
        }

        return builder.toString();
    }

    private String buildRawNetworkErrorMessage(Throwable throwable) {
        StringBuilder builder = new StringBuilder()
                .append(throwable.getClass().getSimpleName());

        if (throwable.getMessage() != null && !throwable.getMessage().isBlank()) {
            builder.append(": ").append(throwable.getMessage());
        }

        Throwable rootCause = findRootCause(throwable);
        if (rootCause != null && rootCause != throwable && rootCause.getMessage() != null && !rootCause.getMessage().isBlank()) {
            builder.append(" | rootCause=")
                    .append(rootCause.getClass().getSimpleName())
                    .append(": ")
                    .append(rootCause.getMessage());
        }

        return builder.toString();
    }

    private Throwable findRootCause(Throwable throwable) {
        Throwable current = throwable;
        Throwable last = throwable;
        while (current != null) {
            last = current;
            current = current.getCause();
        }
        return last;
    }

    private String getMaskedRequestUrl() {
        String maskedKey = maskSecret(apiKey);
        return UriComponentsBuilder.fromHttpUrl(geminiApiUrl)
                .queryParam("key", maskedKey)
                .build()
                .toUriString();
    }

    private String maskSecret(String secret) {
        if (secret == null || secret.isBlank()) {
            return "<empty>";
        }

        if (secret.length() <= 8) {
            return "****";
        }

        return secret.substring(0, 4) + "..." + secret.substring(secret.length() - 4);
    }

    private boolean isApiKeyConfigured() {
        return apiKey != null && !apiKey.isBlank() && !"PLACEHOLDER_KEY".equals(apiKey);
    }

    private record ValidationResult(AiAnalysisResponse sanitizedResponse, boolean hallucinated, int removedCount) {
    }

    private static final class GeminiCallFailure extends RuntimeException {
        private final boolean retryable;
        private final Integer statusCode;
        private final String userMessage;

        private GeminiCallFailure(boolean retryable, Integer statusCode, String userMessage, Throwable cause) {
            super(userMessage, cause);
            this.retryable = retryable;
            this.statusCode = statusCode;
            this.userMessage = userMessage;
        }

        private boolean retryable() {
            return retryable;
        }

        private Integer statusCode() {
            return statusCode;
        }

        private String userMessage() {
            return userMessage;
        }

        private String statusLabel() {
            return statusCode == null ? "NETWORK/TIMEOUT" : String.valueOf(statusCode);
        }
    }
}
