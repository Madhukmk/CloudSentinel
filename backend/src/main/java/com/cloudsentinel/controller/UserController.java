package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.UserDto;
import com.cloudsentinel.service.UserService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "User Management", description = "Admin-only endpoints for user account administration")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    @Operation(summary = "List all user accounts")
    public ResponseEntity<ApiResponse<List<UserDto>>> getAllUsers() {
        return ResponseEntity.ok(ApiResponse.ok(userService.getAllUsers()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single user account details")
    public ResponseEntity<ApiResponse<UserDto>> getUserById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(userService.getUserById(id)));
    }

    @PostMapping
    @Operation(summary = "Create a new user account with role assignment")
    public ResponseEntity<ApiResponse<UserDto>> createUser(
            @Valid @RequestBody UserDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String admin = userDetails != null ? userDetails.getUsername() : "admin";
        UserDto created = userService.createUser(dto, admin);
        return ResponseEntity.ok(ApiResponse.ok("User created successfully", created));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update user details, role, status, or reset password")
    public ResponseEntity<ApiResponse<UserDto>> updateUser(
            @PathVariable Long id,
            @RequestBody UserDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String admin = userDetails != null ? userDetails.getUsername() : "admin";
        UserDto updated = userService.updateUser(id, dto, admin);
        return ResponseEntity.ok(ApiResponse.ok("User updated successfully", updated));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete user account with safety checks")
    public ResponseEntity<ApiResponse<Void>> deleteUser(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String admin = userDetails != null ? userDetails.getUsername() : "admin";
        userService.deleteUser(id, admin);
        return ResponseEntity.ok(ApiResponse.ok("User deleted successfully", null));
    }
}
