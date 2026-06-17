package com.mihir.springsightai.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * Filter that intercepts every HTTP request to check for a valid Bearer JWT token in the headers.
 * If found and valid, sets the authentication state in Spring Security's SecurityContext.
 */
@Slf4j
@Component
@RequiredArgsConstructor
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserDetailsService userDetailsService;

    @Override
    protected void doFilterInternal(
            @NonNull HttpServletRequest request,
            @NonNull HttpServletResponse response,
            @NonNull FilterChain filterChain
    ) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwt;
        final String userEmail;

        log.debug("[JwtAuthFilter] Incoming request: {} {}", request.getMethod(), request.getRequestURI());
        log.debug("[JwtAuthFilter] Authorization header: {}", authHeader);

        // Skip parsing if Authorization header is missing or incorrect format
        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            log.debug("[JwtAuthFilter] No Bearer token found. Skipping JWT validation.");
            filterChain.doFilter(request, response);
            return;
        }

        jwt = authHeader.substring(7);

        try {
            userEmail = jwtUtil.extractUsername(jwt);
            log.debug("[JwtAuthFilter] Extracted username from JWT: {}", userEmail);

            if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
                UserDetails userDetails = this.userDetailsService.loadUserByUsername(userEmail);
                log.debug("[JwtAuthFilter] Loaded UserDetails for: {}", userDetails.getUsername());

                boolean isValid = jwtUtil.isTokenValid(jwt, userDetails);
                log.debug("[JwtAuthFilter] Token valid: {}", isValid);

                if (isValid) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails,
                            null,
                            userDetails.getAuthorities()
                    );
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    // Populate SecurityContext with authenticated user
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                    log.debug("[JwtAuthFilter] SecurityContext populated for user: {}", userEmail);
                } else {
                    log.warn("[JwtAuthFilter] Token validation FAILED for user: {}", userEmail);
                }
            } else {
                log.debug("[JwtAuthFilter] Skipping auth — userEmail null or SecurityContext already set.");
            }

        } catch (Exception e) {
            // Log the exact exception so the real cause of 403 is visible in the console
            log.error("[JwtAuthFilter] JWT processing failed: {} — {}", e.getClass().getSimpleName(), e.getMessage());
        }

        filterChain.doFilter(request, response);
    }
}
