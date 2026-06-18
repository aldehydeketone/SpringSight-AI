import api from '../lib/api';
import { AiAnalysisRequest, RootCauseResponse } from '../types';

export const AiService = {
  async analyzeRootCause(request: AiAnalysisRequest): Promise<RootCauseResponse> {
    const response = await api.post<RootCauseResponse>('/api/ai/root-cause', request);
    return response.data;
  },

  classifyIntent(prompt: string): string {
    const p = prompt.toLowerCase();

    // Check for non-technical or trivial intents (OTHER)
    const otherKeywords = [
      'joke', 'poem', 'story', 'song', 'relationship', 'movie', 'ipl', 'cricket',
      'weather', 'politics', 'gossip', 'trivia', 'who are you', 'how are you',
      'hello', 'hi', 'hey'
    ];
    
    // If it's a very short hello, we might want to prompt them to ask a technical question.
    // Let's check coding/tech keywords
    const techKeywords = [
      'log', 'exception', 'stack trace', 'error', 'debug', 'root cause', 'java',
      'spring', 'boot', 'hibernate', 'jpa', 'sql', 'mysql', 'database', 'connection',
      'api', 'rest', 'security', 'jwt', 'auth', 'nullpointer', 'bean', 'controller',
      'service', 'repository', 'query', 'docker', 'deploy', 'port', 'null pointer',
      'array', 'list', 'map', 'loop', 'class', 'method', 'function', 'variable', 'git'
    ];

    const hasTech = techKeywords.some(kw => p.includes(kw));
    const hasOther = otherKeywords.some(kw => p.includes(kw));

    if (hasOther && !hasTech) {
      return 'OTHER';
    }

    if (p.includes('beancreation') || p.includes('spring') || p.includes('boot') || p.includes('autowired')) {
      return 'SPRING_BOOT';
    }
    if (p.includes('database') || p.includes('hibernate') || p.includes('sql') || p.includes('mysql') || p.includes('jpa') || p.includes('connection')) {
      return 'DATABASE';
    }
    if (p.includes('nullpointer') || p.includes('stacktrace') || p.includes('stack trace') || p.includes('exception') || p.includes('error') || p.includes('log')) {
      return 'LOG_ANALYSIS';
    }
    if (p.includes('java') || p.includes('code') || p.includes('api') || p.includes('rest') || p.includes('programming') || p.includes('function')) {
      return 'PROGRAMMING';
    }
    if (p.includes('deploy') || p.includes('docker') || p.includes('devops') || p.includes('port') || p.includes('infrastructure')) {
      return 'DEVOPS';
    }

    return hasTech ? 'DEBUGGING' : 'OTHER';
  },

  async askAssistant(prompt: string): Promise<string> {
    const category = this.classifyIntent(prompt);

    if (category === 'OTHER') {
      return `SpringSight AI Assistant is designed for:

• Log Analysis
• Exception Debugging
• Root Cause Investigation
• Java & Spring Boot Development
• Database Troubleshooting
• Backend Engineering

Please ask a software engineering or debugging related question.`;
    }

    // Return smart expert response based on category
    if (category === 'SPRING_BOOT') {
      return `### Spring Boot Diagnoses

This matches a **SPRING_BOOT** configuration or runtime issue.

**Common Causes:**
1. **Missing Bean Definition**: Ensure class is annotated with \`@Component\`, \`@Service\`, or \`@Repository\`.
2. **Scan Package Issues**: Ensure your class resides in a package scanned by \`@SpringBootApplication\`.
3. **Circular Dependencies**: Two components autowired into each other.

**Recommended Fix:**
Use setter/constructor injection or annotate with \`@Lazy\` to resolve circular dependency loops. Validate annotation packages.`;
    }

    if (category === 'DATABASE') {
      return `### Database Connection & ORM Diagnoses

This matches a **DATABASE** or persistence layer issue.

**Common Causes:**
1. **Connection Exhaustion**: Pool size too small for incoming concurrent requests.
2. **SQL Grammar Exception**: Mismatched entity mappings, invalid column names, or syntax errors.
3. **Dialect Mismatch**: Mismatched dialect for target DBMS in \`application.properties\`.

**Recommended Fix:**
Check network configurations, ensure database is running on the expected port, and verify your \`spring.jpa.properties.hibernate.dialect\`.`;
    }

    if (category === 'LOG_ANALYSIS' || category === 'DEBUGGING') {
      return `### Incident & Stack Trace Diagnoses

This matches a **LOG_ANALYSIS** / **DEBUGGING** task.

**Analysis Steps:**
1. Check the very first line of the stack trace to find the root exception name (e.g., \`java.lang.NullPointerException\`).
2. Search for the first line starting with \`at com.yourcompany...\` to locate the source code line causing the failure.
3. Check for any nested \`Caused by:\` sections at the bottom of the stack trace.

Feel free to paste a snippet of the log error here, and I'll walk you through debugging it!`;
    }

    return `### Software Engineering Assistant

I've categorized your query under technical engineering support.

**Expert Advice:**
- Ensure you have robust unit tests covering the failing paths.
- Check environment variables in your deployment pipeline.
- Ensure that your local configuration matches production parameters as closely as possible.

Let me know how I can help with code snippets, API design, or debugging steps!`;
  },
};
