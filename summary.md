# SpringSight AI Technical Project Summary

## 1. Executive Summary

**What it is:** SpringSight AI is an intelligent log analysis platform that allows developers and system administrators to upload application log files, parse them into structured formats, and leverage AI (Google Gemini) to automatically diagnose root causes, assess severity, and recommend actionable fixes.
**Why it was built:** To automate the tedious and error-prone process of manual log analysis and debugging, reducing mean time to resolution (MTTR) for application issues.
**Target users:** Software Engineers, DevOps, Site Reliability Engineers (SREs), and System Administrators.
**Real-world problem it solves:** Sifting through thousands of log lines to find the source of an issue is time-consuming. SpringSight AI accelerates this by highlighting critical errors and providing AI-driven insights directly from stack traces and error logs.
**Core business value:** Increases developer productivity, minimizes application downtime, and standardizes incident reporting through automated PDF report generation.
**High-level architecture:** A modern, decoupled architecture consisting of a React single-page application (SPA) frontend communicating via REST APIs with a Java Spring Boot backend. The backend manages persistence using Spring Data JPA (MySQL/PostgreSQL), orchestrates AI calls to Google Gemini, and secures endpoints using stateless JWT authentication.

## 2. Complete Tech Stack

**Backend:**
*   **Java Version:** 17
*   **Spring Boot:** 3.2.x (assumed based on standard MVC approach)
*   **Spring Security:** Stateless JWT-based authentication
*   **Spring Data JPA:** ORM for database interaction
*   **Hibernate:** JPA provider
*   **Build Tool:** Maven (`pom.xml`)
*   **JWT:** `io.jsonwebtoken` (jjwt) for token generation and validation
*   **Lombok:** Boilerplate reduction (`@Data`, `@Builder`, `@RequiredArgsConstructor`)
*   **Validation:** `jakarta.validation` (`spring-boot-starter-validation`)
*   **PDF Generation:** OpenPDF (`com.github.librepdf:openpdf`)
*   **Mail:** Spring Mail (`spring-boot-starter-mail`) for verification and password resets
*   **AI Integration:** Spring WebFlux (`WebClient`) for asynchronous REST calls to the Google Gemini API.

**Frontend:**
*   **Framework:** React 19
*   **Language:** TypeScript
*   **Build Tool:** Vite
*   **Styling:** Tailwind CSS (utility-first CSS)
*   **State Management:** React Context (`AuthContext`)
*   **Routing:** React Router DOM (assumed based on standard SPA routing)
*   **Icons:** Lucide React (assumed)
*   **Animations:** Framer Motion (assumed)
*   **Charts:** Recharts (assumed)

## 3. Folder Structure (Backend)

```text
src/main/java/com/mihir/springsightai/
├── ai/                 # Gemini API integration and prompt building
│   ├── dto/            # AI Request/Response wrappers
│   └── service/        # GeminiService, LogAiContextBuilder, PromptBuilder
├── auth/               # Authentication and User management
│   ├── controller/     # AuthController (register, login, verify, reset)
│   ├── dto/            # LoginRequest, AuthResponse, etc.
│   ├── entity/         # User, EmailVerificationToken, PasswordResetToken
│   ├── repository/     # Repositories for auth entities
│   └── service/        # AuthService, EmailService
├── config/             # Global configurations (e.g., AppConfig, CorsConfig)
├── exception/          # Custom exceptions and GlobalExceptionHandler
├── log/                # Log parsing, storage, and statistical analysis
│   ├── controller/     # LogParseController
│   ├── dto/            # ParseResponse, AnalysisResponse, summaries
│   ├── entity/         # LogFile, ParsedLog
│   ├── repository/     # LogFileRepository, ParsedLogRepository
│   ├── service/        # LogParserService, LogAnalysisService
│   └── util/           # LogPatternUtil (regex patterns)
├── report/             # AI Analysis Reports and PDF export
│   ├── controller/     # AnalysisReportController
│   ├── dto/            # Report responses and dashboard summaries
│   ├── entity/         # AnalysisReport
│   ├── repository/     # AnalysisReportRepository
│   └── service/        # AnalysisReportService, PdfReportService
└── security/           # Spring Security filter chain and JWT utilities
    ├── CustomUserDetailsService.java
    ├── JwtAuthFilter.java
    ├── JwtUtil.java
    └── SecurityConfig.java
```

## 4. Feature Summary

1.  **User Authentication:** Registration with email verification, JWT-based login, and password reset workflows.
2.  **Log File Management:** Uploading log files, storing metadata, and managing ownership.
3.  **Log Parsing:** Regex-based parsing of log lines into structured data (Timestamp, Level, Message) with support for stack trace continuation.
4.  **Log Analysis:** Statistical breakdown of log levels (INFO, WARN, ERROR), identifying top recurring errors, and assessing system health.
5.  **AI Root Cause Analysis:** Enriching AI prompts with structured log evidence (errors, stack traces) to ask Gemini for a root cause, severity, impact, recommended fixes, and prevention steps.
6.  **Report Generation:** Storing AI diagnosis history and exporting detailed diagnosis reports to PDF via OpenPDF.
7.  **Dashboard:** Summarized view of all past reports, categorized by severity, with total error counts.

## 5. Backend/Frontend Architecture

**Backend Architecture:**
The backend follows a layered, domain-driven design structure.
*   **Controllers** handle HTTP routing and delegate business logic.
*   **Services** contain core business rules (e.g., `LogParserService`, `GeminiService`).
*   **Repositories** manage database persistence via Spring Data JPA interfaces.
*   **DTOs** decouple internal entity models from external API contracts.

**Frontend Architecture:** (Needs Verification on specifics)
*   **API Layer:** Axios instances intercept requests to attach JWT tokens to the `Authorization` header automatically.
*   **State Management:** `AuthContext` provides global authentication state and user details across the app.
*   **Routing:** Protected routes wrapper ensures only authenticated users can access the dashboard and log upload components.

## 6. Database

**Entities & Relationships:**
*   **`User`**: Core user record.
    *   One-to-Many with `LogFile`.
    *   One-to-Many with `AnalysisReport`.
*   **`LogFile`**: Metadata for an uploaded file (filename, path, upload time).
    *   Many-to-One with `User`.
    *   One-to-Many with `ParsedLog`.
*   **`ParsedLog`**: A single parsed log line (timestamp, level, message).
    *   Many-to-One with `LogFile`.
*   **`AnalysisReport`**: Saved AI diagnosis results.
    *   Many-to-One with `User`.
*   **`EmailVerificationToken` / `PasswordResetToken`**: Time-limited tokens mapped to a `User` for security flows.

## 7. API Endpoints

**Auth (`/api/auth`):**
*   `POST /register`: Register user.
*   `POST /login`: Authenticate user.
*   `GET /verify-email`: Verify email token.
*   `POST /forgot-password`: Request reset.
*   `POST /reset-password`: Reset password.

**Logs (`/api/logs`):**
*   *Needs Verification:* `POST /upload` for file uploads.
*   *Needs Verification:* `POST /{id}/parse` to trigger parsing.
*   *Needs Verification:* `GET /{id}/analysis` to get stats.

**AI (`/api/ai`):**
*   *Needs Verification:* `POST /analyze` to trigger Gemini root cause analysis.

**Reports (`/api/reports`):**
*   `GET /`: Get user report history.
*   `GET /dashboard`: Get dashboard summaries.
*   `GET /{id}`: Get a single report.
*   `DELETE /{id}`: Delete a report.
*   `GET /{id}/pdf`: Download report as PDF.

## 8. DTOs

Data Transfer Objects are strictly used for API requests and responses to prevent Entity exposure.
*   **Auth:** `LoginRequest`, `RegisterRequest`, `AuthResponse`, `UserDTO`.
*   **Log:** `ParseResponse` (counts), `AnalysisResponse` (stats, top errors), `ErrorSummary`, `WarningSummary`.
*   **AI:** `AiAnalysisRequest`, `AiAnalysisResponse` (rootCause, severity, impact, etc.).
*   **Report:** `AnalysisReportResponse`, `DashboardSummaryResponse`.

## 9. Security

*   **Filter Chain:** `SecurityConfig` defines routes. `/api/auth/**` is public. All other `/api/**` routes require authentication. CSRF is disabled (standard for stateless APIs).
*   **JWT Filter:** `JwtAuthFilter` extends `OncePerRequestFilter`. It extracts the Bearer token, validates it using `JwtUtil`, loads the user via `CustomUserDetailsService`, and populates the `SecurityContextHolder`.
*   **Data Isolation:** Services enforce ownership checks (e.g., `LogAnalysisService.validateOwnership`) to ensure users can only access their own logs and reports.

## 10. AI Architecture

*   **Integration:** Communicates with Google Gemini via `WebClient` in `GeminiService`.
*   **Context Builder:** `LogAiContextBuilder` intelligently extracts up to 30 ERROR lines, 10 WARN lines, and 15 stack trace fragments from the database to inject into the prompt, staying within token limits.
*   **Prompting:** `PromptBuilder` constructs a strict prompt enforcing a specific JSON schema output. It has a fallback mode if log parsing fails.
*   **Resilience:** Implements retry logic with exponential backoff for 429 (Rate Limit) and 503 (Service Unavailable) errors.
*   **Sanitization:** Uses a hallucination check (`validateAndSanitizeResponse`) to strip AI fabrications that aren't backed by the log evidence.

## 11. PDF Generation

*   **Library:** OpenPDF.
*   **Implementation:** `PdfReportServiceImpl` constructs the PDF programmatically.
*   **Structure:** Includes a branded header, a metadata table (ID, Filename, Date, Severity Badges), and dynamic text sections for Root Cause, Impact, Recommended Fixes, and Prevention.
*   **Events:** Uses `PdfPageEventHelper` (`PdfReportFooterEvent`) to draw dynamic footers (page numbers, branding) on every page.

## 12. Exception Handling

*   **Global Handler:** Uses `@RestControllerAdvice` (`GlobalExceptionHandler` - assumed based on standard patterns).
*   **Custom Exceptions:** Domain-specific runtime exceptions:
    *   `LogFileNotFoundException`, `LogParseException`, `NoParsedLogsException`
    *   `ReportNotFoundException`, `UnauthorizedReportAccessException`
    *   `EmailAlreadyExistsException`, `InvalidTokenException`, `EmailNotVerifiedException`

## 13. Validation

*   **Jakarta Validation:** Used on DTOs (e.g., `@NotBlank`, `@Email` in `RegisterRequest`). Controllers likely use `@Valid`.

## 14. Logging

*   **Framework:** SLF4J with Logback (Spring Boot default).
*   **Usage:** Extensive `log.info`, `log.debug`, and `log.error` statements throughout services (especially in `GeminiService` and `LogParserService`) for observability and tracing AI request payloads.

## 15. Request Flows

**Example: AI Root Cause Analysis Flow**
1. Frontend calls `/api/ai/analyze` with `logFileId`.
2. `GeminiService.generateRootCauseAnalysis` is invoked.
3. `LogAiContextBuilder` fetches `ParsedLog` entities (ERRORs and WARNs) for the file.
4. `PromptBuilder` creates a JSON-schema-constrained prompt injecting the log evidence.
5. `WebClient` posts to Gemini API (with retry logic).
6. Response is cleaned (Markdown stripped), mapped to `AiAnalysisResponse`, sanitized for hallucinations, and returned to the frontend.

## 16. System Flow

1. **User Sign Up:** Registers, verifies email (optional locally, mandatory in prod).
2. **Log Upload:** Uploads a `.log` file. Backend saves to disk and creates `LogFile` record.
3. **Parse & Analyze:** User triggers parsing. `LogParserService` reads file, parses lines via regex, and saves `ParsedLog` records. `LogAnalysisService` generates statistical summary.
4. **AI Diagnosis:** User requests AI diagnosis. Gemini analyzes logs and provides fixes.
5. **Report Save & Export:** User saves the diagnosis as an `AnalysisReport`. User can later export this as a PDF.

## 17. Phase History (Assumed based on architecture)

1.  **Phase 1:** Core structure, Auth (JWT), and basic entity setup.
2.  **Phase 2:** Log file uploading and regex-based parsing engine.
3.  **Phase 3:** Integration of Gemini API and prompt engineering.
4.  **Phase 4:** Report persistence, dashboard statistics, and PDF generation.
5.  **Phase 5:** Frontend integration (React/Vite).

## 18. Challenges

*   **Token Limits:** Sending raw log files to Gemini exceeds token limits. Solved by `LogAiContextBuilder` intelligently filtering and chunking only ERRORs/WARNs and stack traces.
*   **AI Hallucinations:** AI sometimes invents exception names or classes. Solved by `validateAndSanitizeResponse` verifying AI output against the original log evidence text.
*   **Resilience:** Gemini API can timeout or rate limit. Solved by exponential backoff and retry mechanisms in `GeminiService`.

## 19. Roadmap (Potential)

*   *Needs Verification:* Support for JSON formatted logs.
*   *Needs Verification:* Integration with live log streams (AWS CloudWatch, Datadog, ELK).
*   *Needs Verification:* Team collaboration/sharing of reports.
*   *Needs Verification:* More LLM providers (OpenAI, Anthropic).

## 20. Interview Summary

The architecture is heavily influenced by clean code principles, leveraging standard Spring Boot features for security and data access, while using custom robust logic for AI context building and hallucination mitigation. The design prioritizes data isolation, token-efficient AI prompting, and highly detailed reporting capabilities.

## 21. File References

*   `JwtAuthFilter.java`: JWT interception and SecurityContext population.
*   `SecurityConfig.java`: Route security rules and filter registration.
*   `GeminiService.java`: AI request execution, retry logic, and sanitization.
*   `PromptBuilder.java`: JSON-constrained prompt generation.
*   `LogAiContextBuilder.java`: Intelligent log filtering for AI prompts.
*   `LogParserService.java`: Disk reading and regex parsing of logs.
*   `LogPatternUtil.java`: Regex definitions for log formats.
*   `PdfReportServiceImpl.java`: OpenPDF document construction.
*   `AuthService.java` & `EmailService.java`: Registration and verification flows.
