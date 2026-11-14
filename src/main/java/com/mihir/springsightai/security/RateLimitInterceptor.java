package com.mihir.springsightai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mihir.springsightai.auth.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.ObjectProvider;
import org.springframework.data.redis.core.RedisTemplate;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.servlet.HandlerInterceptor;

import java.time.Duration;
import java.util.HashMap;
import java.util.Map;
import java.util.concurrent.ConcurrentHashMap;
import java.util.concurrent.atomic.AtomicInteger;

/**
 * Rate limiting interceptor enforcing a limit of 20 requests per hour on AI endpoints.
 * Resilient design: Uses Redis if available, otherwise seamlessly falls back to an in-memory counter.
 * A Redis connection glitch will NEVER break file analysis.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final ObjectProvider<RedisTemplate<String, Object>> redisTemplateProvider;
    private final ObjectMapper objectMapper;
    private static final int MAX_REQUESTS_PER_HOUR = 20;

    // In-memory fallback map (userId -> count)
    private final Map<Long, AtomicInteger> inMemoryCounts = new ConcurrentHashMap<>();

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof User)) {
            return true;
        }

        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        int requestCount = 0;

        boolean countedByRedis = false;
        try {
            RedisTemplate<String, Object> redisTemplate = redisTemplateProvider.getIfAvailable();
            if (redisTemplate != null) {
                String key = "rate_limit::ai::" + userId;
                Long current = redisTemplate.opsForValue().increment(key, 1);
                if (current != null) {
                    if (current == 1) {
                        redisTemplate.expire(key, Duration.ofHours(1));
                    }
                    requestCount = current.intValue();
                    countedByRedis = true;
                }
            }
        } catch (Exception ex) {
            log.warn("[RateLimitInterceptor] Redis unavailable ({}). Gracefully falling back to in-memory rate limiting.", ex.getMessage());
        }

        if (!countedByRedis) {
            // In-memory counting fallback
            requestCount = inMemoryCounts.computeIfAbsent(userId, k -> new AtomicInteger(0)).incrementAndGet();
        }

        if (requestCount > MAX_REQUESTS_PER_HOUR) {
            log.warn("[RateLimitInterceptor] Rate limit exceeded for userId={}", userId);
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("success", false);
            errorDetails.put("message", "Too many requests. You have exceeded the limit of 20 AI analysis requests per hour.");
            errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
            
            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
            return false;
        }

        return true;
    }
}
