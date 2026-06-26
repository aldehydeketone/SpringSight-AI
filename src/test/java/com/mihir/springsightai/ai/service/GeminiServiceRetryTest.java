package com.mihir.springsightai.ai.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.assertj.core.api.Assertions;
import org.junit.jupiter.api.AfterAll;
import org.junit.jupiter.api.BeforeAll;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.http.MediaType;
import org.springframework.web.reactive.function.client.WebClient;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;

import java.io.IOException;
import java.io.OutputStream;
import java.net.InetSocketAddress;
import java.net.ServerSocket;
import java.nio.charset.StandardCharsets;
import java.util.List;
import java.util.concurrent.atomic.AtomicInteger;

import static org.assertj.core.api.Assertions.assertThat;

class GeminiServiceRetryTest {

    private static HttpServer server;
    private static int serverPort;
    private static final AtomicInteger requestCount = new AtomicInteger();
    private static volatile List<StubResponse> queuedResponses = List.of();

    private GeminiService geminiService;

    @BeforeAll
    static void startServer() throws IOException {
        server = HttpServer.create(new InetSocketAddress(0), 0);
        server.createContext("/v1beta/models/gemini-2.5-flash:generateContent", GeminiServiceRetryTest::handleRequest);
        server.start();
        serverPort = server.getAddress().getPort();
    }

    @AfterAll
    static void stopServer() {
        if (server != null) {
            server.stop(0);
        }
    }

    @BeforeEach
    void setUp() {
        requestCount.set(0);
        queuedResponses = List.of();
        String baseUrl = "http://localhost:" + serverPort + "/v1beta/models/gemini-2.5-flash:generateContent";
        this.geminiService = new GeminiService(
                "test-key",
                baseUrl,
                new ObjectMapper(),
                WebClient.builder().baseUrl(baseUrl).build()
        );
    }

    @Test
    void retries503ThenSucceeds() {
        queuedResponses = List.of(
                new StubResponse(503, "{\"error\":\"overloaded\"}"),
                new StubResponse(503, "{\"error\":\"overloaded\"}"),
                new StubResponse(200, "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"hello\"}]}}]}")
        );

        String response = geminiService.generateContent("Say hello");

        assertThat(response).isEqualTo("hello");
        assertThat(requestCount.get()).isEqualTo(3);
    }

    @Test
    void retries429ThenSucceeds() {
        queuedResponses = List.of(
                new StubResponse(429, "{\"error\":\"busy\"}"),
                new StubResponse(200, "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"hi\"}]}}]}")
        );

        String response = geminiService.generateContent("Say hi");

        assertThat(response).isEqualTo("hi");
        assertThat(requestCount.get()).isEqualTo(2);
    }

    @Test
    void doesNotRetryOnBadRequest() {
        queuedResponses = List.of(
                new StubResponse(400, "{\"error\":\"bad request\"}")
        );

        Assertions.assertThatThrownBy(() -> geminiService.generateContent("broken"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("AI service request was rejected. Please try again.");

        assertThat(requestCount.get()).isEqualTo(1);
    }

    @Test
    void retriesTemporaryNetworkFailures() {
        int unusedPort;
        try (ServerSocket socket = new ServerSocket(0)) {
            unusedPort = socket.getLocalPort();
        } catch (IOException e) {
            throw new RuntimeException(e);
        }

        String unreachableBaseUrl = "http://localhost:" + unusedPort + "/v1beta/models/gemini-2.5-flash:generateContent";
        GeminiService unreachableService = new GeminiService(
                "test-key",
                unreachableBaseUrl,
                new ObjectMapper(),
                WebClient.builder().baseUrl(unreachableBaseUrl).build()
        );

        long start = System.currentTimeMillis();

        Assertions.assertThatThrownBy(() -> unreachableService.generateContent("network"))
                .isInstanceOf(RuntimeException.class)
                .hasMessage("AI service is temporarily unavailable. Please try again in a few minutes.");

        long elapsed = System.currentTimeMillis() - start;
        assertThat(elapsed).isGreaterThanOrEqualTo(13_000L);
    }

    private static void handleRequest(HttpExchange exchange) throws IOException {
        int index = requestCount.getAndIncrement();
        StubResponse response = queuedResponses.isEmpty()
                ? new StubResponse(200, "{\"candidates\":[{\"content\":{\"parts\":[{\"text\":\"default\"}]}}]}")
                : queuedResponses.get(Math.min(index, queuedResponses.size() - 1));

        byte[] body = response.body().getBytes(StandardCharsets.UTF_8);
        exchange.getResponseHeaders().set("Content-Type", MediaType.APPLICATION_JSON_VALUE);
        exchange.sendResponseHeaders(response.status(), body.length);
        try (OutputStream outputStream = exchange.getResponseBody()) {
            outputStream.write(body);
        } finally {
            exchange.close();
        }
    }

    private record StubResponse(int status, String body) {
    }
}
