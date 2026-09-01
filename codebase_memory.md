# Codebase Memory — SpringSight AI

This document serves as the permanent architectural brain of the SpringSight AI project. It outlines the codebase layout, patterns, configurations, security flows, database constraints, frontend design guidelines, and request flow examples.

---

## 1. Project Overview & Business Purpose
* **Vision**: SpringSight AI is an intelligent Spring Boot log analyzer that helps developers troubleshoot production errors. By combining rule-based error classification with AI-powered root cause analysis, it dramatically reduces log triage time.
* **Why it exists**: Reading thousands of raw log lines is exhausting. This tool aggregates log line metrics, maps exceptions to categories, uses LLMs to provide context/fixes, offers a DevOps-focused chat assistant, and exports polished reports.
* **Primary Users**: Mid-level Java developers, junior programmers/students learning Spring Boot, SREs, and DevOps engineers managing server deployments.

---

## 2. Tech Stack
* **Backend**: Java 17, Spring Boot 3.2.x, Spring Security 6.x, Spring Data JPA, Hibernate, OpenPDF 2.0.3, Maven.
* **Frontend**: React 19 (compiled with Vite 6), TypeScript, TailwindCSS 4, Framer Motion 12, Recharts 2.
* **Database**: MySQL/MariaDB (JPA/Hibernate dialect).
* **AI Provider**: Google Gemini API (`gemini-1.5-flash` model via HTTP REST request).
* **Styling**: Sleek dark mode (`#020617` background) with vanilla CSS used for precise animation controls. Brand name must always remain exactly **SpringSight**.

---

## 3. DTO Architecture
### Key DTOs
| DTO Name | Category | Used By | Purpose |
| :--- | :--- | :--- | :--- |
| `LoginRequest` | Request | `AuthController` | Captures email and password for auth check. |
| `AuthResponse` | Response | `AuthController` | Contains token string and `UserDTO` structure. |
| `RegisterRequest` | Request | `AuthController` | Handles sign-up payloads (name, email, password). |
| `ForgotPasswordRequest`| Request | `AuthController` | Captures email to trigger password reset emails. |
| `ResetPasswordRequest` | Request | `AuthController` | Contains OTP token, email, and the new password. |
| `UserDTO` | Response | Multiple | Safe user profile payload (excludes passwords). |
| `LogUploadResponse` | Response | `LogFileController` | Returns analysis ID upon log validation. |
| `ParsedLogResponse` | Response | `LogParseController`| Returns paginated parsed lines for frontend list views. |
| `AnalysisResponse` | Response | `LogAnalysisController`| Contains AI insights (cause, severity, fix, impact). |
| `DashboardSummaryResponse`| Response| `LogAnalysisController`| Aggregates total logs, error counts, and severities. |
| `ErrorResponse` | Response | `GlobalExceptionHandler`| Standard JSON shape for all exceptions and validation failures. |

### Architectural Rules
* **Rule**: Controllers MUST use DTOs, not JPA entities, for external API contracts. Exposing entities directly causes security vulnerabilities (e.g., exposing passwords, lazy-loaded relation loops, or SQL mapping leaks).
* DTOs decouple the database schema from the API contract, permitting safe schema modification without breaking frontend integrations.

---

## 4. Security Architecture
Stateless JWT-based authentication combined with Spring Security 6.x.

### Request Verification Pipeline
```
[Client Request]
       ↓
[JwtAuthFilter] (Validates Auth header, parses JWT token)
       ↓
[SecurityContextHolder] (Updates authentication token if valid)
       ↓
[SecurityFilterChain] (Evaluates role mapping and API authorization)
       ↓
[REST Controller]
```

### Flow Details
* **SecurityFilterChain**: Configured to require authentication for all endpoints under `/api/**` except public endpoints (`/api/auth/**` and system test routes).
* **Authentication Filter (`JwtAuthFilter`)**: Extends `OncePerRequestFilter`. Extracts the Bearer token, decodes the email claim using the secret signing key, and populates `SecurityContextHolder`.
* **CustomUserDetailsService**: Resolves email requests directly to database `User` records.
* **Token Missing**: Denied immediately with a `401 Unauthorized` status.
* **Token Invalid/Expired**: Cleanly catches `ExpiredJwtException` or `SignatureException` and bubbles them up to response writers returning a standard `ErrorResponse`.

---

## 5. Exception Handling Architecture
Errors are intercepted globally using a centralized rest controller advice.

### Architecture Map
* **Global Handler**: Annotated with `@RestControllerAdvice` in `exception/GlobalExceptionHandler.java`.
* **Standard Response Shape**:
  ```json
  {
    "success": false,
    "error": "ERROR_CODE",
    "message": "Human-readable message",
    "timestamp": "2026-06-24T22:45:00Z"
  }
  ```
* **Validation Failure Mapping**: Translates binding exception field errors into flat user-readable arrays returned as `400 Bad Request`.

### Key Exception Categories
| Category | Exception Name | Response Code | Description |
| :--- | :--- | :--- | :--- |
| **Authentication** | `BadCredentialsException` | `401 Unauthorized` | Invalid password or user email during login. |
| **Authorization** | `AccessDeniedException` | `403 Forbidden` | Accessing another user's file or report records. |
| **Log Access** | `LogFileNotFoundException` | `404 Not Found` | Requesting analysis on a file that has been deleted on disk. |
| **Report Status** | `ReportNotFoundException` | `404 Not Found` | PDF download requested for a non-existent ID. |
| **AI Failures** | `AiServiceException` | `502 Bad Gateway` | AI provider timeout or unparseable response structures. |
| **Upload Issues** | `InvalidFileTypeException` | `400 Bad Request` | Rejecting uploads not ending in `.log` extension. |

---

## 6. Validation Strategy
Input validation is enforced using Jakarta Validation (`jakarta.validation-api`).

* **Enforcement Point**: Request DTO classes (e.g., `RegisterRequest`, `ResetPasswordRequest`) are annotated with constraints. Controllers apply `@Valid` to request body mappings.
* **Why DTO Validation?** Ensuring requests are structurally valid before hitting services stops corrupted payloads from reaching the repository layer.
* **Common Annotations Used**:
  * `@NotBlank` / `@NotNull`: Blocks empty string inputs or missing properties.
  * `@Email`: Assures email string adheres to username@domain formatting.
  * `@Size(min = ..., max = ...)`: Limits string lengths (e.g., passwords min 8 chars).
  * `@Pattern(regexp = ...)`: Evaluates strings against regex rules.

---

## 7. Logging Strategy
Centralized logging utilizing SLF4J and Lombok `@Slf4j` annotations.

* **Controller Layer**: Log HTTP mapping ingress (e.g. `[POST] uploading log file...`).
* **Service Layer**: Log operational decisions (e.g., "Parsed 421 lines successfully").
* **Exception Layer**: Global handler logs root stack trace via `log.error()`.
* **Sensitive Data Rules**: Clear text passwords, JWT secret keys, and personal identification tokens must never be written to application logs.
* **Logging Tracing Levels**:
  * `DEBUG`: Raw parser lines, token parsing states.
  * `INFO`: Successful logins, log parsing stats, PDF generation.
  * `WARN`: Validation errors, login failures, rule fallbacks.
  * `ERROR`: Database down states, AI service failures, disk write blockages.

---

## 8. AI / Gemini Architecture
* **Responsibility**: Custom AI service builds structured prompts, queries Google Gemini endpoints, parses output structures, and formats reports.
* **Rule-Based Prioritization**: Known exceptions are mapped to severity/categories first. Gemini is invoked only to extract deep root cause analysis and recommended fixes.
* **Prompt Construction**: Merges exception class name, rule-based severity, and a limited sliding window of surrounding log context lines (up to 15 lines) into a system instruction context.
* **Fallback Rules**: If Gemini is offline, returns a default report using the pre-classified rule output.
* **Chat Restriction**: The assistant chat endpoint has system prompts that restrict responses to Java programming, Spring Boot dependencies, Hibernate anomalies, and log auditing.

---

## 9. Report & PDF Generation Architecture
* **Report Persistence**: `AnalysisReport` records are stored in the database to prevent duplicate Gemini billing queries and display historical trends in the Dashboard.
* **Request Pipeline**:
  ```
  [Uploaded Log] ➔ [Regex Parser Engine] ➔ [JPA ParsedLog Records] 
         ↓
  [AI Extraction & Classification] ➔ [AnalysisReport Database Record] 
         ↓
  [Dashboard Charts & Stats] ➔ [OpenPDF Renderer Output] ➔ [File Download]
  ```
* **PDF Engine**: Uses OpenPDF. Generates a multi-page document featuring structured sections, monospace code highlight fonts, and a stylized corporate color palette.
* **Failure Guard**: If PDF compilation errors occur, the stream is closed safely, returning a clean HTTP `500 Server Error` response instead of writing corrupted file downloads.

---

## 10. Database and Entity Rules
```
         [User] (1)
            │
            ├───(0..*) [LogFile] (Persistent log file metadata)
            │
            └───(0..*) [AnalysisReport] (AI evaluation results)
```
* **User**: Owns files and reports. Contains lifecycle fields.
* **LogFile**: Metadata describing uploaded files. Physical log files are stored on server disk (`/uploads`).
* **ParsedLog**: Entity containing parsed line records linked to a parent `LogFile` via FK with cascade delete.
* **AnalysisReport**: Cached evaluation metrics (errors, info counts, root cause, fixes).
* **Token Entities (`EmailVerificationToken`, `PasswordResetToken`)**: Transient token records referencing a User ID with configured expiration dates.

---

## 11. Feature/Phase History
* **Phase 1: Auth & JWT**: Integrated spring security, JWT auth filter, and encryption.
* **Phase 2: Log Storage**: Configured safe upload directory and validation rules.
* **Phase 3: Log Parsing**: Integrated regex reader counting log levels (INFO/WARN/ERROR).
* **Phase 4: Classification**: Built local rule-based category/severity mapper.
* **Phase 5: UI & Dashboard**: Scaffolded React dashboard panels.
* **Phase 6: Report Persistence**: Created SQL migrations for caching AI reports.
* **Phase 7: PDF Export**: Implemented document styling and down-stream file export.

---

## 12. Request Flow Examples
### 12.1 Authentication Login Flow
```
LoginPage (user enters credentials)
    ↓
auth.service.ts ➔ POST /api/auth/login
    ↓
JwtAuthFilter (checks routes, skips verification)
    ↓
AuthController ➔ AuthService.login()
    ↓
AuthService checks password hash ➔ Generates JWT token string
    ↓
Client receives token ➔ Stores in LocalStorage ➔ Redirects to /dashboard
```

### 12.2 Log Processing and AI Analysis Flow
```
UploadPage (file upload) ➔ POST /api/logs/upload (with JWT)
    ↓
LogFileController ➔ LogUploadService stores file to disk, records database ID
    ↓
Client invokes POST /api/logs/{id}/parse ➔ Returns parsed count
    ↓
Client requests GET /api/logs/{id}/analysis ➔ Invokes AI Service
    ↓
AI Service builds prompt ➔ Google Gemini evaluates context
    ↓
AnalysisReport persisted ➔ Returns Analysis DTO response ➔ UI renders details
```

---

## 13. Frontend Architecture
* **Token Storage**: JWT tokens are persisted in `localStorage`.
* **API Client**: Service modules use a standardized Axios client adding headers dynamically.
* **Protected Routes**: Wrap elements in a `<ProtectedRoute />` checking AuthContext tokens.
* **Visual Guidelines**:
  * Keep modern glassmorphism aesthetic (`rgba(8, 14, 28, 0.88)` card styling).
  * Brand styling must preserve exact **SpringSight** names.
  * Use vanilla CSS only where high-performance animations (e.g. success transition circles) are necessary.

### 13.1 Technical Debt / Environment Setup
* **Vite Version**: This project currently uses Vite 4 instead of Vite 6 due to local Windows Application Control policies blocking the native Rollup 4 Rust binary (`@rollup/rollup-win32-x64-msvc.node`). 
* **Tailwind CSS**: Because Vite 4 does not support the `@tailwindcss/vite` plugin (which requires Vite 5+), Tailwind 4 is configured via `@tailwindcss/postcss` in `postcss.config.js` as a workaround. If the Windows policy is relaxed, upgrade to Vite 6 and switch back to the official Vite plugin for better build performance.

---

## 14. Useful File Map
### Backend Core
* **Security Configuration**: `src/main/java/com/mihir/springsightai/security/SecurityConfig.java`
* **JWT Request Filter**: `src/main/java/com/mihir/springsightai/security/JwtAuthFilter.java`
* **Exception Handler Advice**: `src/main/java/com/mihir/springsightai/exception/GlobalExceptionHandler.java`
* **AI Gemini Service**: `src/main/java/com/mihir/springsightai/ai/service/GeminiService.java`
* **PDF Export Service**: `src/main/java/com/mihir/springsightai/report/service/PdfReportService.java`

### Frontend Core
* **Router Definition**: `frontend/src/App.tsx`
* **Auth Context Hook**: `frontend/src/lib/auth.tsx`
* **API Service client**: `frontend/src/services/auth.service.ts`
* **Card Transition Overlay**: `frontend/src/components/ui/login-success-transition.tsx`
