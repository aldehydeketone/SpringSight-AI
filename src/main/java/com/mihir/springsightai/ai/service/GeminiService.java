package com.mihir.springsightai.ai.service;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;
import com.mihir.springsightai.ai.dto.AiAnalysisRequest;
import com.mihir.springsightai.ai.dto.AiAnalysisResponse;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.MediaType;
import org.springframework.stereotype.Service;
import org.springframework.web.reactive.function.client.WebClient;
import org.springframework.web.reactive.function.client.WebClientResponseException;

import java.time.Duration;
import java.util.List;
import java.util.Map;

/**
 * Service to interact with Google Gemini API.
 * Uses Gemini 2.5 Flash model via REST API with WebClient.
 * Supports both raw text generation and structured root cause analysis.
 */
@Service
@Slf4j
public class GeminiService {

    private static final String GEMINI_API_URL = "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent";
    private static final Duration REQUEST_TIMEOUT = Duration.ofSeconds(30);

    private final WebClient webClient;
    private final ObjectMapper objectMapper;
    private final String apiKey;

    public GeminiService(
            @Value("${gemini.api.key}") String apiKey,
            ObjectMapper objectMapper
    ) {
        this.apiKey = apiKey;
        this.objectMapper = objectMapper;
        this.webClient = WebClient.builder()
                .baseUrl(GEMINI_API_URL)
                .build();
        log.info("[GeminiService] Initialized with Gemini 2.5 Flash model");
    }

    /**
     * Sends a prompt to Gemini API and returns the text response.
     */
    public String generateContent(String prompt) {
        log.info("[GeminiService] generateContent prompt: {}", prompt);
        return callGeminiApi(prompt);
    }

    /**
     * Generates AI Root Cause Analysis from log analysis summary.
     */
    public AiAnalysisResponse generateRootCauseAnalysis(AiAnalysisRequest request) {
        log.info("[GeminiService] Starting root cause analysis for file: {}", request.getFilename());

        // Step 1: Build structured prompt
        String prompt = PromptBuilder.buildRootCausePrompt(request);
        log.info("[GeminiService] Generated prompt:\n{}", prompt);

        // Step 2: Call Gemini API
        String rawResponse = callGeminiApi(prompt);

        // Step 3: Validate response is not empty
        if (rawResponse == null || rawResponse.isBlank()) {
            log.error("[GeminiService] Gemini returned empty response");
            throw new RuntimeException("Gemini API returned empty response");
        }

        // Step 4: Clean and parse JSON response
        String cleanedJson = cleanJsonResponse(rawResponse);
        log.info("[GeminiService] Cleaned JSON response from Gemini: {}", cleanedJson);

        // Step 5: Deserialize into AiAnalysisResponse
        try {
            AiAnalysisResponse response = objectMapper.readValue(cleanedJson, AiAnalysisResponse.class);
            log.info("[GeminiService] Root cause analysis completed. Severity: {}, Confidence: {}",
                    response.getSeverity(), response.getConfidence());
            return response;

        } catch (Exception e) {
            log.error("[GeminiService] Failed to parse Gemini response into AiAnalysisResponse. Cleaned JSON: {}", cleanedJson, e);
            throw new RuntimeException("Failed to parse Gemini response: " + e.getMessage(), e);
        }
    }

    /**
     * Calls the Gemini API with timeout and error handling.
     */
    private String callGeminiApi(String prompt) {
        Map<String, Object> requestBody = Map.of(
                "contents", List.of(
                        Map.of("parts", List.of(
                                Map.of("text", prompt)
                        ))
                )
        );

        try {
            String requestJson = objectMapper.writeValueAsString(requestBody);
            log.info("[GeminiService] Request URL: {}?key={}", GEMINI_API_URL, apiKey != null && apiKey.length() > 5 ? apiKey.substring(0, 5) + "..." : "null");
            log.info("[GeminiService] Request Payload sent to Gemini:\n{}", requestJson);
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

            log.info("[GeminiService] Raw JSON Response received from Gemini:\n{}", responseJson);
            return extractTextFromResponse(responseJson);

        } catch (WebClientResponseException.TooManyRequests e) {
            log.error("[GeminiService] Gemini API rate limit exceeded (429). Response body: {}", e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API rate limit exceeded. Please try again later.", e);

        } catch (WebClientResponseException e) {
            log.error("[GeminiService] WebClientResponseException ({} {}). Response body: {}",
                    e.getStatusCode().value(), e.getStatusText(), e.getResponseBodyAsString());
            throw new RuntimeException("Gemini API error: " + e.getStatusCode() + " - " + e.getResponseBodyAsString(), e);

        } catch (Exception e) {
            if (e.getCause() instanceof java.util.concurrent.TimeoutException) {
                log.error("[GeminiService] Gemini API request timed out after {}s", REQUEST_TIMEOUT.getSeconds());
                throw new RuntimeException("Gemini API request timed out", e);
            }
            log.error("[GeminiService] Unexpected error calling Gemini API: {}", e.getMessage(), e);
            throw new RuntimeException("Failed to get response from Gemini API: " + e.getMessage(), e);
        }
    }

    /**
     * Cleans AI response text that may contain markdown code fences or extra whitespace.
     */
    private String cleanJsonResponse(String response) {
        String cleaned = response.trim();

        // Remove markdown code fences if present
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

    /**
     * Extracts the generated text from Gemini API JSON response.
     */
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

            log.warn("[GeminiService] Unexpected response structure: {}", responseJson);
            return "No response generated";

        } catch (Exception e) {
            log.error("[GeminiService] Failed to parse Gemini response: {}", e.getMessage());
            throw new RuntimeException("Failed to parse Gemini API response", e);
        }
    }
}
