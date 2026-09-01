# PROJECT EXPLANATION TEMPLATE (Fresher / Solo Project Version)

## 1. Project Name + One-Line Summary

**Project Name:** SpringSight AI

**Simple Summary:**
This is a full-stack log analysis platform used for automatically finding the root cause of errors in application logs.
It helps developers by reading raw log files, perfectly grouping the big multi-line errors together, and using Google Gemini AI to figure out exactly what went wrong and how to fix it.

## 2. Problem the Project Solves

I wanted to build SpringSight AI because manually reading through thousands of lines of logs to find why an app crashed in production is incredibly slow and boring.
Most tutorial-level projects don't cover unstructured text parsing or third-party AI integration, so I built this to actually implement a real-world observability tool the way a production system would.

## 3. Your Responsibilities (MOST IMPORTANT PART)

I designed and built this project end-to-end. My work included:
1. Designing the database tables and how they link together for users, logs, and reports.
2. Building and testing REST APIs so the frontend can upload files and get data.
3. Securing the app with a login system using JWT (JSON Web Tokens) so only authorized users can do things.
4. **Integrating with Google Gemini AI API:** Instead of blindly sending a massive log file, my code acts as a smart filter. It counts the errors, finds the exact times they happened, and pulls out the most common exceptions. I built a `PromptBuilder` class that only sends this clean summary to Gemini using Spring's `WebClient`. I also force Gemini to give me back a clean JSON response. This makes it super easy for my frontend to show the Root Cause, Severity, and Recommended Fix without crashing.
5. **Building the Regex Log Parser:** I built a custom "State Machine" parser. Normal logs are one line, but Java errors are huge (like 50 lines). My parser reads the file line by line and glues all 50 lines of an error together into one clean database row. This stops the AI from getting confused by broken text.
6. Structuring the code using a simple layered pattern: Controller, Service, and Repository.

## 4. Tech Stack

- Java 17
- Spring Boot 3
- Spring Security (JWT)
- Spring Data JPA / Hibernate
- MySQL
- Spring WebFlux (WebClient for AI)
- React 19 (TypeScript, Vite)
- TailwindCSS

## 5. Architecture

The architecture is a layered monolith — which means it's just one Spring Boot app, not complex microservices. It has:
- A Controller, Service, and Repository layer pattern.
- A MySQL database to store everything safely.
- A secure login system using Spring Security filters and JWT.
- REST APIs that send data to a React frontend.

For a project of this size, a monolith was the right choice. I wanted to focus on getting the hard parts right — like the core logic, the regex parsing, security, and the database design — before trying to split it into microservices.

## 6. High-Level Flow

1. A user logs into the React website and uploads a `.log` file.
2. The request reaches a Spring Boot Controller, which checks if the file format is okay.
3. Spring Security filters check the user's JWT token to make sure they are actually logged in.
4. The Service layer takes over: it reads the text file line by line, runs my custom Regex parser, and groups the big errors cleanly into database rows.
5. The Service then picks the worst errors and calls the Gemini AI API using WebClient.
6. The Repository layer saves Gemini's JSON answer, and the backend sends it to the frontend to show the user.

## 7. Key Technical Challenges & Solutions

During development, I encountered and solved several complex issues. The two most significant and practical challenges were:

**CHALLENGE 1 — The Duplicate Parsing Bug (Database Cleanup)**
* **What happened:** When a user clicked "parse" on a file that had 5 errors, it saved 5 rows. But if they clicked it again to refresh, the database didn't overwrite them. It added 5 more, so the database now had 10 rows, then 15 rows.
* **Root cause:** My `LogParserService` was only telling the database to `saveAll()` the new records. I totally forgot to tell it to look for and delete the old records for that file first.
* **How I fixed it:** I wrote a `deleteByLogFileId()` method in my Repository. Now, my parser service runs this delete query to wipe the old data before it saves the new data. Most importantly, I wrapped this whole process inside a Spring `@Transactional` annotation. 
* **What I learned:** I learned that if you let users re-run a process, you have to actively clean up the old data. I also learned why database transactions are so important — because if the new save fails (like a database crash), `@Transactional` undoes the delete automatically, so data is never lost.

**CHALLENGE 2 — Gemini API Error Handling (API Backup Plans)**
* **What happened:** Sometimes the Gemini AI took too long to answer, gave a 429 rate limit error, or returned bad JSON. When this happened, my backend threw an error and completely crashed the user's request.
* **Root cause:** At first, my code just assumed the Gemini API would always give a perfect, fast answer 100% of the time. There was no backup plan if the API failed.
* **How I fixed it:** I added explicit error handling in my `GeminiService`. I used `try-catch` blocks to handle WebClient HTTP failures and JSON parsing errors. Now, the app catches these issues, logs them, and safely returns a polite error message to the frontend without crashing the server.
* **What I learned:** Whenever your code depends on someone else's API, you have to expect it can fail, and handle that instead of just hoping it always works.

## 8. Deep Dive: The Regex Parser State Machine

Because parsing big multi-line Java errors was my hardest task, I had to build a custom "State Machine". 

In my `LogPatternUtil.java` file, I wrote three main regex patterns:
- `TIMESTAMP_PATTERN` looks for standard dates and times.
- `SPRING_BOOT_LOG_PATTERN` looks for Spring's default log format (Time, Level, PID, Logger, and Message).
- `EXCEPTION_CONTINUATION_PATTERN` looks for lines that start with "at com...", "Caused by:", or "... x more".

**The Logic:** My `LogParserService` loops through the file line by line, and it remembers the current log entry it is building. If it sees a line that matches the standard log pattern, it creates a new `ParsedLog` object. However, if a line doesn't match a normal log, but DOES match the `EXCEPTION_CONTINUATION_PATTERN` (meaning it's the middle of an error trace), it doesn't create a new log. Instead, it glues that text to the bottom of the current log entry.
This approach makes sure that a massive 50-line error stays perfectly grouped together as one single database row, attached to the exact `ERROR` log that caused it.

## 9. Impact

- Built 5+ REST API modules across authentication, log management, AI analysis, and PDF reports.
- Designed a custom Regex state machine capable of perfectly grouping massive 50-line Java stack traces without losing data.
- Handled advanced Spring features like `@Transactional` for safe database operations and `WebClient` for calling external AI APIs.
- I focused on correctness, proper AI integration, and security first; performance testing is something I'd want to add next.

## 10. Closing Summary

Overall, I designed, built, and secured this project end-to-end — from database design to API development, custom text parsing, and AI integration. It gave me real hands-on experience with handling unstructured data, managing database transactions, and writing safe code for third-party APIs, not just following a tutorial.

---

## FINAL ONE-PARAGRAPH PITCH (short version)

This project is a full-stack log analysis platform built to automatically find the root cause of crashes using AI.
I designed and built it end-to-end using Java, Spring Boot, Spring Security, and JPA/Hibernate, with a React frontend.
The architecture is a layered monolith — Controller → Service → Repository — with JWT-based authentication and MySQL storage.
One real challenge I faced was a database duplication bug when re-parsing files, which I solved by writing a cleanup query and using Spring `@Transactional` to ensure data safety.
Overall, this project helped me understand how production-style backend systems process messy text, handle database consistency, and deal with external AI APIs, beyond tutorial-level code.
