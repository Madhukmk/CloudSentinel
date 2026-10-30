package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.entity.LogSource;
import com.cloudsentinel.service.LogSourceService;
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
@RequestMapping("/api/sources")
@Tag(name = "Log Sources", description = "Endpoints for managing registered log producers and sensors")
public class LogSourceController {

    @Autowired
    private LogSourceService sourceService;

    @GetMapping
    @Operation(summary = "List all registered log sources")
    public ResponseEntity<ApiResponse<List<LogSource>>> getAllSources() {
        return ResponseEntity.ok(ApiResponse.ok(sourceService.getAllSources()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single log source details")
    public ResponseEntity<ApiResponse<LogSource>> getSourceById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(sourceService.getSourceById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Register a new log source (Admin only)")
    public ResponseEntity<ApiResponse<LogSource>> createSource(
            @Valid @RequestBody LogSource source,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        LogSource created = sourceService.createSource(source, username);
        return ResponseEntity.ok(ApiResponse.ok("Log source created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing log source (Admin only)")
    public ResponseEntity<ApiResponse<LogSource>> updateSource(
            @PathVariable Long id,
            @Valid @RequestBody LogSource source,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        LogSource updated = sourceService.updateSource(id, source, username);
        return ResponseEntity.ok(ApiResponse.ok("Log source updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Toggle active/inactive status of a log source (Admin only)")
    public ResponseEntity<ApiResponse<LogSource>> toggleStatus(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        LogSource toggled = sourceService.toggleStatus(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Log source status toggled", toggled));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a log source (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteSource(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        sourceService.deleteSource(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Log source deleted successfully", null));
    }
}
