package com.mihir.springsightai.ai.service;

import java.util.List;
import java.util.Map;

/**
 * Immutable value object carrying enriched log context for the AI prompt.
 *
 * <p>Built by {@link LogAiContextBuilder} from {@code ParsedLog} records and
 * passed directly to {@link PromptBuilder#buildRootCausePrompt(Object, LogAiContext)}.
 * This type is intentionally package-private — it is an internal detail of the
 * AI service layer and must never be exposed as a REST DTO or API contract.
 *
 * <p>Fields:
 * <ul>
 *   <li>{@code exceptionFrequency} — distinct exception class names mapped to their occurrence count.</li>
 *   <li>{@code errorLogLines} — up to 30 formatted ERROR entries (timestamp | level | first message line).</li>
 *   <li>{@code warnLogLines} — up to 10 formatted WARN entries.</li>
 *   <li>{@code stackTraceFragments} — the first 20 lines of each unique stack trace found in error messages.</li>
 *   <li>{@code earliestTimestamp} — ISO-like string of the oldest log entry in this context window.</li>
 *   <li>{@code latestTimestamp} — ISO-like string of the most recent log entry in this context window.</li>
 * </ul>
 */
record LogAiContext(
        Map<String, Long> exceptionFrequency,
        List<String> errorLogLines,
        List<String> warnLogLines,
        List<String> stackTraceFragments,
        String earliestTimestamp,
        String latestTimestamp
) {

    /** Returns {@code true} when no meaningful diagnostic data was extracted. */
    boolean isEmpty() {
        return errorLogLines.isEmpty() && warnLogLines.isEmpty();
    }
}
