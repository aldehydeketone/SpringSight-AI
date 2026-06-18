package com.mihir.springsightai.log.util;

import org.junit.jupiter.api.Test;

import java.util.regex.Matcher;
import java.util.regex.Pattern;

import static org.assertj.core.api.Assertions.assertThat;

class LogPatternUtilTest {

    @Test
    void matchesSpringBootLogAndExtractsApplicationMessage() throws Exception {
        Matcher matcher = pattern("SPRING_BOOT_LOG_PATTERN").matcher(
                "2026-06-18 10:15:21.112 INFO 12456 --- [main] c.s.SpringSightApplication : Starting");

        assertThat(matcher.matches()).isTrue();
        assertThat(matcher.group(1)).isEqualTo("2026-06-18 10:15:21.112");
        assertThat(matcher.group(2)).isEqualTo("INFO");
        assertThat(matcher.group(3)).isEqualTo("Starting");
    }

    @Test
    void matchesIsoTimestampsAndAdditionalLevels() throws Exception {
        Pattern logPattern = pattern("LOG_PATTERN");

        assertThat(logPattern.matcher("2026-06-18T10:15:21.123Z TRACE tracing request").matches()).isTrue();
        assertThat(logPattern.matcher("2026-06-18T10:15:21+05:30 FATAL database unavailable").matches()).isTrue();
    }

    @Test
    void recognizesFrameworkAndDatabaseExceptionContinuations() throws Exception {
        Pattern continuation = pattern("EXCEPTION_CONTINUATION_PATTERN");

        assertThat(continuation.matcher("org.hibernate.exception.ConstraintViolationException: could not execute statement").matches()).isTrue();
        assertThat(continuation.matcher("java.sql.SQLIntegrityConstraintViolationException: duplicate key").matches()).isTrue();
        assertThat(continuation.matcher("io.jsonwebtoken.ExpiredJwtException: JWT expired").matches()).isTrue();
        assertThat(continuation.matcher("Caused by: java.lang.NullPointerException").matches()).isTrue();
    }

    private Pattern pattern(String fieldName) throws Exception {
        Class<?> util = Class.forName("com.mihir.springsightai.log.util.LogPatternUtil");
        return (Pattern) util.getField(fieldName).get(null);
    }
}
