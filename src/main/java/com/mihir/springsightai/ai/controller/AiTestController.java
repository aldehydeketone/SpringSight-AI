package com.mihir.springsightai.ai.controller;

import com.mihir.springsightai.ai.service.GeminiService;
import com.mihir.springsightai.common.ApiResponse;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import io.swagger.v3.oas.annotations.tags.Tag;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Map;

/**
 * Test controller to verify Gemini API integration.
 * JWT protected — requires valid Bearer token.
 */
@RestController
@RequestMapping("/api/ai")
@RequiredArgsConstructor
@Slf4j
@SecurityRequirement(name = "bearerAuth")
@Tag(name = "AI Diagnostics", description = "Gemini connectivity test APIs")
public class AiTestController {

    private final GeminiService geminiService;

    /**
     * Test endpoint to verify Gemini API connectivity.
     * Sends "Say hello in one sentence." and returns the response.
     */
    @GetMapping("/test")
    @Operation(summary = "Test Gemini API connectivity")
    public ResponseEntity<ApiResponse<Map<String, String>>> testGemini() {
        log.info("[AiTestController] Gemini test endpoint called");

        String prompt = "Say hello in one sentence.";
        String geminiResponse = geminiService.generateContent(prompt);

        Map<String, String> data = Map.of(
                "prompt", prompt,
                "response", geminiResponse,
                "model", "gemini-2.5-flash"
        );

        return ResponseEntity.ok(ApiResponse.<Map<String, String>>builder()
                .success(true)
                .message("Gemini API test successful")
                .data(data)
                .build());
    }
}
