package com.mihir.springsightai.auth.service;

import com.mihir.springsightai.auth.dto.AuthResponse;
import com.mihir.springsightai.auth.dto.LoginRequest;
import com.mihir.springsightai.auth.dto.RegisterRequest;
import com.mihir.springsightai.auth.dto.UserDTO;
import com.mihir.springsightai.auth.entity.User;
import com.mihir.springsightai.auth.repository.UserRepository;
import com.mihir.springsightai.exception.EmailAlreadyExistsException;
import com.mihir.springsightai.security.JwtUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Service that handles user registration and authentication (login).
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final AuthenticationManager authenticationManager;

    /**
     * Registers a new user account, encodes their password, persists the user in MySQL,
     * and returns the generated JWT token alongside user details.
     */
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new EmailAlreadyExistsException("Email " + request.getEmail() + " is already registered");
        }

        User user = User.builder()
                .name(request.getName())
                .email(request.getEmail())
                .password(passwordEncoder.encode(request.getPassword()))
                .build();

        User savedUser = userRepository.save(user);
        String jwtToken = jwtUtil.generateToken(savedUser);

        UserDTO userDTO = UserDTO.builder()
                .id(savedUser.getId())
                .name(savedUser.getName())
                .email(savedUser.getEmail())
                .createdAt(savedUser.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userDTO)
                .build();
    }

    /**
     * Validates user credentials. Generates and returns a JWT if successful.
     */
    public AuthResponse login(LoginRequest request) {
        // Authenticate credentials via AuthenticationManager (which will throw if credentials don't match)
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        request.getEmail(),
                        request.getPassword()
                )
        );

        User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new UsernameNotFoundException("User not found with email: " + request.getEmail()));

        String jwtToken = jwtUtil.generateToken(user);

        UserDTO userDTO = UserDTO.builder()
                .id(user.getId())
                .name(user.getName())
                .email(user.getEmail())
                .createdAt(user.getCreatedAt())
                .build();

        return AuthResponse.builder()
                .token(jwtToken)
                .user(userDTO)
                .build();
    }
}
