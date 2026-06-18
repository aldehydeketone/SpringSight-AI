package com.mihir.springsightai.ai.service;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;

/**
 * Utility class to build structured prompts for Gemini AI.
 * Injects analysis data into a carefully engineered prompt
 * that forces JSON-only output from the model.
 */
public class PromptBuilder {

    private PromptBuilder() {
        // Utility class — prevent instantiation
    }

    /**
     * Builds a root cause analysis prompt from log analysis data.
     * The prompt instructs Gemini to act as a Senior SRE and return
     * structured JSON with root cause, severity, impact, fix, prevention, and confidence.
     *
     * @param request The summarized log analysis data
     * @return A fully constructed prompt string
     */
    public static String buildRootCausePrompt(AiAnalysisRequest request) {
        StringBuilder prompt = new StringBuilder();

        // Role assignment
        prompt.append("You are a Senior Site Reliability Engineer and Production Support Engineer.\n\n");

        // Task instructions
        prompt.append("Analyze the following log analysis summary and provide incident diagnosis.\n\n");

        // Inject analysis data
        prompt.append("=== LOG ANALYSIS SUMMARY ===\n");
        prompt.append("File: ").append(request.getFilename()).append("\n");
        prompt.append("Total Logs: ").append(request.getTotalLogs()).append("\n");
        prompt.append("Error Count: ").append(request.getErrorCount()).append("\n");
        prompt.append("Warning Count: ").append(request.getWarnCount()).append("\n");
        prompt.append("Info Count: ").append(request.getInfoCount()).append("\n\n");

        // Top errors
        if (request.getTopErrors() != null && !request.getTopErrors().isEmpty()) {
            prompt.append("Top Errors:\n");
            for (String error : request.getTopErrors()) {
                prompt.append("- ").append(error).append("\n");
            }
            prompt.append("\n");
        }

        // Sample error logs
        if (request.getSampleErrorLogs() != null && !request.getSampleErrorLogs().isEmpty()) {
            prompt.append("Sample Error Log Lines:\n");
            for (String sample : request.getSampleErrorLogs()) {
                prompt.append("- ").append(sample).append("\n");
            }
            prompt.append("\n");
        }

        prompt.append("=== END OF SUMMARY ===\n\n");

        // Output instructions
        prompt.append("Identify:\n");
        prompt.append("1. Most likely root cause\n");
        prompt.append("2. Severity level (LOW, MEDIUM, HIGH, or CRITICAL)\n");
        prompt.append("3. User impact\n");
        prompt.append("4. Recommended fix\n");
        prompt.append("5. Prevention strategy\n");
        prompt.append("6. Confidence level (LOW, MEDIUM, or HIGH)\n\n");

        // Strict output format
        prompt.append("IMPORTANT RULES:\n");
        prompt.append("- Return ONLY valid JSON.\n");
        prompt.append("- Do NOT return markdown.\n");
        prompt.append("- Do NOT wrap in code blocks.\n");
        prompt.append("- Do NOT return explanations outside JSON.\n\n");

        prompt.append("Return exactly this JSON structure:\n");
        prompt.append("{\n");
        prompt.append("  \"rootCause\": \"\",\n");
        prompt.append("  \"severity\": \"\",\n");
        prompt.append("  \"impact\": \"\",\n");
        prompt.append("  \"recommendedFix\": \"\",\n");
        prompt.append("  \"preventionSteps\": \"\",\n");
        prompt.append("  \"confidence\": \"\"\n");
        prompt.append("}\n");

        return prompt.toString();
    }
}
