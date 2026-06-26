package com.mihir.springsightai.ai.service;

import com.mihir.springsightai.ai.dto.AiAnalysisRequest;

import java.util.List;
import java.util.Map;

/**
 * Utility class responsible for constructing structured Gemini prompts.
 *
 * <p>Two overloads are provided:
 * <ul>
 *   <li>{@link #buildRootCausePrompt(AiAnalysisRequest)} — summary-only prompt used when
 *       no {@code logFileId} is available (legacy / sandbox path).</li>
 *   <li>{@link #buildRootCausePrompt(AiAnalysisRequest, LogAiContext)} — enriched prompt
 *       used when {@code ParsedLog} records have been loaded for the file; produces
 *       significantly higher-quality, evidence-based recommendations.</li>
 * </ul>
 *
 * <p>Both overloads produce the same JSON output schema so downstream parsing in
 * {@link GeminiService} requires no changes.
 */
public final class PromptBuilder {

    private PromptBuilder() {
        // Utility class — prevent instantiation
    }

    // -------------------------------------------------------------------------
    // Shared JSON schema instruction (appended by both overloads)
    // -------------------------------------------------------------------------

    private static final String JSON_OUTPUT_RULES =
            "STRICT OUTPUT RULES:\n" +
            "- Return ONLY valid JSON. No markdown. No code blocks. No text outside JSON.\n" +
            "- Do NOT invent any technical details that are not explicitly present in the evidence.\n" +
            "- If the exact root cause cannot be proven from the evidence, set rootCause to: \"Cannot be determined from the provided logs.\"\n" +
            "- If evidence is incomplete, confidence MUST be LOW.\n" +
            "- recommendedFix MUST be a plain string with numbered steps separated by \\n.\n" +
            "- Do NOT use JSON arrays for any field.\n" +
            "- Severity must be exactly one of: LOW, MEDIUM, HIGH, CRITICAL.\n" +
            "- Confidence must be exactly one of: LOW, MEDIUM, HIGH.\n\n";

    private static final String JSON_SCHEMA =
            "Return EXACTLY this JSON structure — no extra fields, no missing fields:\n" +
            "{\n" +
            "  \"rootCause\": \"<evidence-based root cause only; or 'Cannot be determined from the provided logs.'>\",\n" +
            "  \"severity\": \"<LOW|MEDIUM|HIGH|CRITICAL>\",\n" +
            "  \"impact\": \"<user-facing and system impact>\",\n" +
            "  \"recommendedFix\": \"1. <specific actionable step>.\\n2. <specific actionable step>.\\n3. <specific actionable step>.\",\n" +
            "  \"preventionSteps\": \"<one or two sentences on long-term prevention>\",\n" +
            "  \"confidence\": \"<LOW|MEDIUM|HIGH>\"\n" +
            "}\n";

    // -------------------------------------------------------------------------
    // Overload 1 — Summary-based prompt (fallback / no logFileId)
    // -------------------------------------------------------------------------

    /**
     * Builds a root cause analysis prompt from high-level log summary data only.
     * Used when no {@code ParsedLog} context is available.
     *
     * @param request summarised log analysis data from the frontend
     * @return fully constructed prompt string
     */
    public static String buildRootCausePrompt(AiAnalysisRequest request) {
        StringBuilder p = new StringBuilder();

        appendPersonaAndRules(p);

        p.append("=== LOG SUMMARY (limited context) ===\n");
        p.append("File        : ").append(request.getFilename()).append("\n");
        p.append("Total logs  : ").append(request.getTotalLogs()).append("\n");
        p.append("ERROR count : ").append(request.getErrorCount()).append("\n");
        p.append("WARN  count : ").append(request.getWarnCount()).append("\n");
        p.append("INFO  count : ").append(request.getInfoCount()).append("\n\n");

        if (request.getTopErrors() != null && !request.getTopErrors().isEmpty()) {
            p.append("Top error messages:\n");
            for (String err : request.getTopErrors()) {
                p.append("  - ").append(err).append("\n");
            }
            p.append("\n");
        }

        if (request.getSampleErrorLogs() != null && !request.getSampleErrorLogs().isEmpty()) {
            p.append("Sample error log lines:\n");
            for (String sample : request.getSampleErrorLogs()) {
                p.append("  ").append(sample).append("\n");
            }
            p.append("\n");
        }

        p.append("=== END OF SUMMARY ===\n\n");

        appendOutputInstructions(p, false);

        return p.toString();
    }

    // -------------------------------------------------------------------------
    // Overload 2 — Enriched prompt with ParsedLog context
    // -------------------------------------------------------------------------

    /**
     * Builds a high-quality root cause analysis prompt using detailed
     * {@link LogAiContext} extracted from {@code ParsedLog} records.
     *
     * <p>This prompt gives Gemini real evidence — actual exception class names,
     * timestamps, stack traces, and frequency data — so it can produce specific,
     * actionable recommendations rather than generic advice.
     *
     * @param request the original request (for filename and counts)
     * @param context enriched context built from {@code ParsedLog} records
     * @return fully constructed enriched prompt string
     */
    public static String buildRootCausePrompt(AiAnalysisRequest request, LogAiContext context) {
        StringBuilder p = new StringBuilder();

        appendPersonaAndRules(p);

        // --- File metadata ---
        p.append("=== FILE METADATA ===\n");
        p.append("File        : ").append(request.getFilename()).append("\n");
        p.append("Total logs  : ").append(request.getTotalLogs()).append("\n");
        p.append("ERROR count : ").append(request.getErrorCount()).append("\n");
        p.append("WARN  count : ").append(request.getWarnCount()).append("\n");
        p.append("INFO  count : ").append(request.getInfoCount()).append("\n");
        if (context.earliestTimestamp() != null) {
            p.append("Time range  : ").append(context.earliestTimestamp())
             .append(" → ").append(context.latestTimestamp()).append("\n");
        }
        p.append("\n");

        p.append("=== AI EVIDENCE CONTEXT ===\n");
        p.append("- Parsed logs used: ").append(context.errorLogLines().size() + context.warnLogLines().size()).append("\n");
        p.append("- Error entries: ").append(context.errorLogLines().size()).append("\n");
        p.append("- Warn entries : ").append(context.warnLogLines().size()).append("\n");
        p.append("- Stack traces  : ").append(context.stackTraceFragments().size()).append("\n");
        p.append("- Exception types: ").append(context.exceptionFrequency().size()).append("\n\n");

        // --- Exception frequency ---
        Map<String, Long> freq = context.exceptionFrequency();
        if (!freq.isEmpty()) {
            p.append("=== EXCEPTION FREQUENCY (most to least common) ===\n");
            freq.forEach((cls, count) ->
                    p.append("  ").append(count).append("x  ").append(cls).append("\n"));
            p.append("\n");
        }

        // --- ERROR log lines ---
        List<String> errorLines = context.errorLogLines();
        if (!errorLines.isEmpty()) {
            p.append("=== ERROR LOG ENTRIES (").append(errorLines.size()).append(" entries) ===\n");
            for (String line : errorLines) {
                p.append("  ").append(line).append("\n");
            }
            p.append("\n");
        }

        // --- WARN log lines ---
        List<String> warnLines = context.warnLogLines();
        if (!warnLines.isEmpty()) {
            p.append("=== WARN LOG ENTRIES (").append(warnLines.size()).append(" entries) ===\n");
            for (String line : warnLines) {
                p.append("  ").append(line).append("\n");
            }
            p.append("\n");
        }

        // --- Stack trace fragments ---
        List<String> traces = context.stackTraceFragments();
        if (!traces.isEmpty()) {
            p.append("=== STACK TRACE FRAGMENTS ===\n");
            for (int i = 0; i < traces.size(); i++) {
                p.append("--- Trace ").append(i + 1).append(" ---\n");
                p.append(traces.get(i)).append("\n\n");
            }
        }

        p.append("=== END OF LOG DATA ===\n\n");

        appendOutputInstructions(p, true);

        return p.toString();
    }

    // -------------------------------------------------------------------------
    // Private helpers
    // -------------------------------------------------------------------------

    /**
     * Appends the senior SRE persona and evidence-only reasoning constraints
     * that are common to both prompt overloads.
     */
    private static void appendPersonaAndRules(StringBuilder p) {
        p.append("You are a Senior Spring Boot Production Support Engineer with 10+ years of experience ")
         .append("diagnosing production incidents from application logs.\n\n");

        p.append("EVIDENCE RULES — FOLLOW STRICTLY:\n");
        p.append("- Base EVERY conclusion ONLY on the provided log evidence.\n");
        p.append("- Never invent class names, package names, method names, bean names, variable names, line numbers, stack traces, technologies, or configuration values.\n");
        p.append("- Only mention technical identifiers that literally appear in the supplied evidence.\n");
        p.append("- If evidence is missing, explicitly say: \"Cannot be determined from the provided logs.\"\n");
        p.append("- If the logs only show a CommunicationsException or similar transport issue, do NOT invent BeanCreationException, NullPointerException, UserService, Repository, or @Autowired failures unless they literally appear in the logs.\n");
        p.append("- If evidence is incomplete, confidence MUST be LOW.\n");
        p.append("- Recommendations must relate directly to the observed exceptions and log lines.\n\n");
    }

    /**
     * Appends the output format instructions and JSON schema, common to both overloads.
     */
    private static void appendOutputInstructions(StringBuilder p, boolean enrichedContext) {
        p.append("Based on the log evidence above, provide:\n");
        p.append("1. rootCause      — Evidence-based root cause only. ")
         .append("If the exact cause cannot be proven, use the fallback sentence from the rules.\n");
        p.append("2. severity       — Incident severity (LOW / MEDIUM / HIGH / CRITICAL).\n");
        p.append("3. impact         — User-facing and system impact of this issue.\n");
        p.append("4. recommendedFix — 3 to 5 specific, actionable steps directly related to detected exceptions. ")
         .append("Each step on its own line, numbered 1. 2. 3. etc. Do not invent components or code.\n");
        p.append("5. preventionSteps — One or two sentences on how to prevent recurrence.\n");
        p.append("6. confidence     — How confident you are based on available evidence (LOW / MEDIUM / HIGH). ")
         .append("Use LOW whenever evidence is incomplete or indirect.\n\n");

        p.append(JSON_OUTPUT_RULES);
        if (enrichedContext) {
            p.append("EXTRA ENRICHED CONTEXT RULES:\n");
            p.append("- Use the timestamps, levels, logger names, messages, exception frequency, and stack trace fragments above.\n");
            p.append("- Treat the supplied log lines as the only admissible evidence.\n");
            p.append("- Do not infer missing stack frames or source code locations.\n\n");
        }
        p.append(JSON_SCHEMA);
    }
}
