package com.mihir.springsightai.log.service;

import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.io.TempDir;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;
import java.lang.reflect.Proxy;
import java.nio.file.Files;
import java.nio.file.Path;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

import static org.assertj.core.api.Assertions.assertThat;

class LogParserServiceTest {

    @TempDir
    Path tempDir;

    @AfterEach
    void clearSecurityContext() {
        SecurityContextHolder.clearContext();
    }

    @Test
    void parsesSpringBootLogAndPreservesMultilineCauseChain() throws Exception {
        String content = """
                2026-06-18 10:15:21.112 INFO 12456 --- [main] c.s.SpringSightApplication : Starting

                2026-06-18 10:15:25.992 ERROR 12456 --- [main] o.s.b.SpringApplication : Application run failed

                org.springframework.beans.factory.BeanCreationException

                Caused by: java.lang.NullPointerException

                at com.example.UserService.loadUser(UserService.java:42)
                """;

        ParseResult result = parse(content);

        assertThat((boolean) invoke(result.response(), "isSuccess")).isTrue();
        assertThat((int) invoke(result.response(), "getParsedEntries")).isEqualTo(2);
        assertThat(result.saved()).hasSize(2);
        assertThat(invoke(result.saved().get(0), "getTimestamp"))
                .isEqualTo(LocalDateTime.of(2026, 6, 18, 10, 15, 21, 112_000_000));
        assertThat(invoke(result.saved().get(0), "getMessage")).isEqualTo("Starting");
        assertThat(invoke(result.saved().get(1), "getLogLevel")).isEqualTo("ERROR");
        assertThat(invoke(result.saved().get(1), "getMessage")).isEqualTo("""
                Application run failed
                org.springframework.beans.factory.BeanCreationException
                Caused by: java.lang.NullPointerException
                at com.example.UserService.loadUser(UserService.java:42)""");
    }

    @Test
    void parsesIsoTraceAndFatalLogsWithHibernateSqlAndJwtExceptions() throws Exception {
        String content = """
                2026-06-18T10:15:21.123Z TRACE request entered
                2026-06-18T10:15:25+05:30 FATAL persistence and token failure
                org.hibernate.exception.ConstraintViolationException: statement failed
                Caused by: java.sql.SQLIntegrityConstraintViolationException: duplicate key
                SQLState: 23000
                io.jsonwebtoken.ExpiredJwtException: JWT expired
                """;

        ParseResult result = parse(content);

        assertThat((int) invoke(result.response(), "getParsedEntries")).isEqualTo(2);
        assertThat(result.saved()).extracting(log -> invoke(log, "getLogLevel")).containsExactly("TRACE", "FATAL");
        assertThat(invoke(result.saved().get(0), "getTimestamp"))
                .isEqualTo(LocalDateTime.of(2026, 6, 18, 10, 15, 21, 123_000_000));
        assertThat((String) invoke(result.saved().get(1), "getMessage"))
                .contains("org.hibernate.exception.ConstraintViolationException")
                .contains("java.sql.SQLIntegrityConstraintViolationException")
                .contains("SQLState: 23000")
                .contains("io.jsonwebtoken.ExpiredJwtException");
    }

    private ParseResult parse(String content) throws Exception {
        Long fileId = 7L;
        Long userId = 11L;
        Path path = tempDir.resolve("application.log");
        Files.writeString(path, content);

        Object logFile = newInstance("com.mihir.springsightai.log.entity.LogFile");
        invoke(logFile, "setId", fileId);
        invoke(logFile, "setFileName", "application.log");
        invoke(logFile, "setStoredFileName", "stored.log");
        invoke(logFile, "setFileSize", (long) content.length());
        invoke(logFile, "setFileType", "text/plain");
        invoke(logFile, "setFilePath", path.toString());
        invoke(logFile, "setUploadedByUserId", userId);

        Object user = newInstance("com.mihir.springsightai.auth.entity.User");
        invoke(user, "setId", userId);
        invoke(user, "setEmail", "owner@example.com");
        invoke(user, "setPassword", "secret");
        SecurityContextHolder.getContext().setAuthentication(
                new UsernamePasswordAuthenticationToken(user, null, List.of()));

        List<Object> saved = new ArrayList<>();
        Class<?> logFileRepositoryType = Class.forName("com.mihir.springsightai.log.repository.LogFileRepository");
        Class<?> parsedLogRepositoryType = Class.forName("com.mihir.springsightai.log.repository.ParsedLogRepository");

        Object logFileRepository = proxy(logFileRepositoryType, (proxy, method, args) -> {
            if (method.getName().equals("findById")) {
                return Optional.of(logFile);
            }
            return defaultValue(method.getReturnType());
        });
        Object parsedLogRepository = proxy(parsedLogRepositoryType, (proxy, method, args) -> {
            if (method.getName().equals("saveAll")) {
                for (Object item : (Iterable<?>) args[0]) {
                    saved.add(item);
                }
                return args[0];
            }
            return defaultValue(method.getReturnType());
        });

        Class<?> serviceType = Class.forName("com.mihir.springsightai.log.service.LogParserService");
        Object service = serviceType.getConstructor(logFileRepositoryType, parsedLogRepositoryType)
                .newInstance(logFileRepository, parsedLogRepository);

        Object response = invoke(service, "parseLogFile", fileId);
        return new ParseResult(response, saved);
    }

    private Object newInstance(String className) throws Exception {
        return Class.forName(className).getConstructor().newInstance();
    }

    private Object proxy(Class<?> type, InvocationHandler handler) {
        return Proxy.newProxyInstance(type.getClassLoader(), new Class<?>[]{type}, handler);
    }

    private Object invoke(Object target, String methodName, Object... args) throws Exception {
        Method method = findMethod(target.getClass(), methodName, args.length);
        return method.invoke(target, args);
    }

    private Method findMethod(Class<?> type, String methodName, int parameterCount) {
        for (Method method : type.getMethods()) {
            if (method.getName().equals(methodName) && method.getParameterCount() == parameterCount) {
                return method;
            }
        }
        throw new IllegalArgumentException("No method " + methodName + " with " + parameterCount + " arguments on " + type);
    }

    private Object defaultValue(Class<?> type) {
        if (!type.isPrimitive()) {
            return null;
        }
        if (type == boolean.class) {
            return false;
        }
        if (type == void.class) {
            return null;
        }
        return 0;
    }

    private record ParseResult(Object response, List<Object> saved) {
    }
}
