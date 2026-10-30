package com.cloudsentinel.service;

import com.cloudsentinel.dto.UserDto;
import com.cloudsentinel.entity.Role;
import com.cloudsentinel.entity.User;
import com.cloudsentinel.exception.BadRequestException;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.UserRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.util.List;
import java.util.stream.Collectors;

@Service
public class UserService {

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<UserDto> getAllUsers() {
        return userRepository.findAll().stream()
                .map(u -> new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getStatus(), u.getCreatedAt()))
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public UserDto getUserById(Long id) {
        User u = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));
        return new UserDto(u.getId(), u.getName(), u.getEmail(), u.getRole(), u.getStatus(), u.getCreatedAt());
    }

    @Transactional
    public UserDto createUser(UserDto dto, String currentAdmin) {
        if (userRepository.existsByEmail(dto.getEmail().trim())) {
            throw new BadRequestException("User already exists with email: " + dto.getEmail());
        }

        if (!StringUtils.hasText(dto.getPassword())) {
            throw new BadRequestException("Password is required for new users");
        }

        User user = new User();
        user.setName(dto.getName().trim());
        user.setEmail(dto.getEmail().trim());
        user.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        user.setRole(dto.getRole() != null ? dto.getRole() : Role.ANALYST);
        user.setStatus(dto.getStatus() != null ? dto.getStatus() : "ACTIVE");

        User saved = userRepository.save(user);
        auditLogService.logAction(null, currentAdmin, "CREATE_USER",
                String.format("Created user '%s' (%s, %s)", saved.getEmail(), saved.getRole(), saved.getStatus()), null);

        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getStatus(), saved.getCreatedAt());
    }

    @Transactional
    public UserDto updateUser(Long id, UserDto dto, String currentAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        // Safeguard: Check if deactivating or changing role of the last admin
        if (user.getRole() == Role.ADMIN && (dto.getRole() != Role.ADMIN || "INACTIVE".equalsIgnoreCase(dto.getStatus()))) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Action rejected: Cannot deactivate or demote the sole remaining Administrator.");
            }
        }

        user.setName(dto.getName().trim());
        user.setRole(dto.getRole());
        user.setStatus(dto.getStatus());

        if (StringUtils.hasText(dto.getPassword())) {
            user.setPassword(passwordEncoder.encode(dto.getPassword().trim()));
        }

        User saved = userRepository.save(user);
        auditLogService.logAction(null, currentAdmin, "UPDATE_USER",
                String.format("Updated user '%s' (#%d)", saved.getEmail(), id), null);

        return new UserDto(saved.getId(), saved.getName(), saved.getEmail(), saved.getRole(), saved.getStatus(), saved.getCreatedAt());
    }

    @Transactional
    public void deleteUser(Long id, String currentAdmin) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        if (user.getRole() == Role.ADMIN) {
            long adminCount = userRepository.countByRole(Role.ADMIN);
            if (adminCount <= 1) {
                throw new BadRequestException("Action rejected: Cannot delete the sole remaining Administrator.");
            }
        }

        userRepository.delete(user);
        auditLogService.logAction(null, currentAdmin, "DELETE_USER",
                String.format("Deleted user '%s' (#%d)", user.getEmail(), id), null);
    }
}
