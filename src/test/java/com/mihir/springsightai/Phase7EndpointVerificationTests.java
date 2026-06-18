package com.mihir.springsightai;

import com.fasterxml.jackson.databind.JsonNode;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.web.client.TestRestTemplate;
import org.springframework.http.HttpEntity;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.jdbc.core.JdbcTemplate;
import org.springframework.jdbc.support.GeneratedKeyHolder;
import org.springframework.jdbc.support.KeyHolder;

import java.sql.PreparedStatement;
import java.sql.Statement;
import java.sql.Timestamp;
import java.time.LocalDateTime;
import java.util.Map;

import static org.assertj.core.api.Assertions.assertThat;

@SpringBootTest(
        webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT,
        properties = {
                "spring.datasource.url=jdbc:h2:mem:phase7db;DB_CLOSE_DELAY=-1;MODE=MySQL",
                "spring.datasource.driver-class-name=org.h2.Driver",
                "spring.datasource.username=sa",
                "spring.datasource.password=",
                "spring.jpa.properties.hibernate.dialect=org.hibernate.dialect.H2Dialect"
        }
)
class Phase7EndpointVerificationTests {

    @Autowired
    private TestRestTemplate restTemplate;

    @Autowired
    private JdbcTemplate jdbcTemplate;

    @Test
    void reportHistoryPdfSwaggerAndOwnershipAreWorking() {
        AuthDetails owner = registerAndGetToken("Owner User", "owner.phase7@example.com");
        AuthDetails other = registerAndGetToken("Other User", "other.phase7@example.com");
        Long reportId = insertReportForUser(owner.userId());

        ResponseEntity<JsonNode> historyResponse = restTemplate.exchange(
                "/api/reports",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(owner.token())),
                JsonNode.class
        );
        assertThat(historyResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(historyResponse.getBody()).isNotNull();
        assertThat(historyResponse.getBody().isArray()).isTrue();
        assertThat(historyResponse.getBody()).hasSize(1);
        assertThat(historyResponse.getBody().get(0).get("id").asLong()).isEqualTo(reportId);

        ResponseEntity<byte[]> pdfResponse = restTemplate.exchange(
                "/api/reports/" + reportId + "/pdf",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(owner.token())),
                byte[].class
        );
        assertThat(pdfResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(pdfResponse.getHeaders().getContentType()).isEqualTo(MediaType.APPLICATION_PDF);
        assertThat(pdfResponse.getHeaders().getFirst(HttpHeaders.CONTENT_DISPOSITION)).contains("analysis-report-" + reportId + ".pdf");
        assertThat(pdfResponse.getBody()).startsWith("%PDF".getBytes());

        ResponseEntity<JsonNode> forbiddenReportResponse = restTemplate.exchange(
                "/api/reports/" + reportId,
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(other.token())),
                JsonNode.class
        );
        assertThat(forbiddenReportResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<byte[]> forbiddenPdfResponse = restTemplate.exchange(
                "/api/reports/" + reportId + "/pdf",
                HttpMethod.GET,
                new HttpEntity<>(authHeaders(other.token())),
                byte[].class
        );
        assertThat(forbiddenPdfResponse.getStatusCode()).isEqualTo(HttpStatus.FORBIDDEN);

        ResponseEntity<String> openApiResponse = restTemplate.getForEntity("/v3/api-docs", String.class);
        assertThat(openApiResponse.getStatusCode()).isEqualTo(HttpStatus.OK);
        assertThat(openApiResponse.getBody()).contains("SpringSight AI API", "bearerAuth");
    }

    private AuthDetails registerAndGetToken(String name, String email) {
        Map<String, String> request = Map.of(
                "name", name,
                "email", email,
                "password", "Password@123"
        );

        ResponseEntity<JsonNode> response = restTemplate.postForEntity("/api/auth/register", request, JsonNode.class);

        assertThat(response.getStatusCode()).isEqualTo(HttpStatus.CREATED);
        assertThat(response.getBody()).isNotNull();
        return new AuthDetails(
                response.getBody().get("data").get("token").asText(),
                response.getBody().get("data").get("user").get("id").asLong()
        );
    }

    private Long insertReportForUser(Long userId) {
        KeyHolder keyHolder = new GeneratedKeyHolder();

        jdbcTemplate.update(connection -> {
            PreparedStatement statement = connection.prepareStatement("""
                    insert into analysis_reports
                    (filename, total_logs, error_count, warn_count, info_count, root_cause, severity, impact,
                     recommended_fix, prevention_steps, confidence, created_at, user_id)
                    values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
                    """, Statement.RETURN_GENERATED_KEYS);
            statement.setString(1, "phase7-sample.log");
            statement.setInt(2, 12);
            statement.setInt(3, 4);
            statement.setInt(4, 3);
            statement.setInt(5, 5);
            statement.setString(6, "Database connection pool exhaustion.");
            statement.setString(7, "HIGH");
            statement.setString(8, "Requests can slow down or fail during traffic spikes.");
            statement.setString(9, "Increase pool size and tune query timeouts.");
            statement.setString(10, "Add pool metrics, alerts, and load testing.");
            statement.setString(11, "HIGH");
            statement.setTimestamp(12, Timestamp.valueOf(LocalDateTime.now()));
            statement.setLong(13, userId);
            return statement;
        }, keyHolder);

        return keyHolder.getKey().longValue();
    }

    private HttpHeaders authHeaders(String token) {
        HttpHeaders headers = new HttpHeaders();
        headers.setBearerAuth(token);
        return headers;
    }

    private record AuthDetails(String token, Long userId) {
    }
}
