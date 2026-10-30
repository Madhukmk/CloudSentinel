package com.cloudsentinel.service;

import com.cloudsentinel.dto.AuthResponse;
import com.cloudsentinel.dto.LoginRequest;
import com.cloudsentinel.dto.UserDto;
import com.cloudsentinel.entity.Role;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.exception.BadRequestException;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.UserRepository;
import com.cloudsentinel.security.JwtTokenProvider;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
public class AuthService {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private JwtTokenProvider tokenProvider;

    public AuthResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getEmail().trim(),
                        loginRequest.getPassword().trim()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        User user = userRepository.findByEmail(loginRequest.getEmail().trim())
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));

        if (!"ACTIVE".equalsIgnoreCase(user.getStatus())) {
            throw new BadRequestException("User account is deactivated. Please contact an administrator.");
        }

        String jwt = tokenProvider.generateToken(user.getEmail(), user.getId(), user.getName(), user.getRole().name());

        return new AuthResponse(jwt, user.getId(), user.getName(), user.getEmail(), user.getRole().name());
    }

    @Transactional(readOnly = true)
    public UserDto getCurrentUser(String email) {
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with email: " + email));
        return new UserDto(user.getId(), user.getName(), user.getEmail(), user.getRole(), user.getStatus(), user.getCreatedAt());
    }
}
