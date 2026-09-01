package com.mihir.springsightai.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.mihir.springsightai.auth.entity.User;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
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

/**
 * Rate limiting interceptor enforcing a limit of 20 requests per hour on AI endpoints.
 * Algorithm: Fixed 1-hour counter window using Redis INCR with a 1-hour TTL initialized on first request.
 * User identity: Extracted strictly from the authenticated Spring Security principal.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class RateLimitInterceptor implements HandlerInterceptor {

    private final RedisTemplate<String, Object> redisTemplate;
    private final ObjectMapper objectMapper;
    private static final int MAX_REQUESTS_PER_HOUR = 20;

    @Override
    public boolean preHandle(HttpServletRequest request, HttpServletResponse response, Object handler) throws Exception {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        
        if (authentication == null || !authentication.isAuthenticated() || !(authentication.getPrincipal() instanceof User)) {
            // Unauthenticated requests should be handled by standard Spring Security filters.
            return true;
        }

        User user = (User) authentication.getPrincipal();
        Long userId = user.getId();
        
        String key = "rate_limit::ai::" + userId;

        Long currentRequests = redisTemplate.opsForValue().increment(key, 1);

        if (currentRequests != null && currentRequests == 1) {
            redisTemplate.expire(key, Duration.ofHours(1));
        }

        if (currentRequests != null && currentRequests > MAX_REQUESTS_PER_HOUR) {
            log.warn("[RateLimitInterceptor] Rate limit exceeded for userId={}", userId);
            
            response.setStatus(HttpStatus.TOO_MANY_REQUESTS.value());
            response.setContentType(MediaType.APPLICATION_JSON_VALUE);
            
            Map<String, Object> errorDetails = new HashMap<>();
            errorDetails.put("success", false);
            errorDetails.put("message", "Too many requests. You have exceeded the limit of 20 AI analysis requests per hour.");
            errorDetails.put("status", HttpStatus.TOO_MANY_REQUESTS.value());
            
            response.getWriter().write(objectMapper.writeValueAsString(errorDetails));
            return false; // Stop processing
        }

        return true;
    }
}