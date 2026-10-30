package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.service.DetectionRuleService;
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
@RequestMapping("/api/rules")
@Tag(name = "Detection Rules", description = "Endpoints for managing automated security threat detection rules")
public class DetectionRuleController {

    @Autowired
    private DetectionRuleService ruleService;

    @GetMapping
    @Operation(summary = "List all configured detection rules")
    public ResponseEntity<ApiResponse<List<DetectionRule>>> getAllRules() {
        return ResponseEntity.ok(ApiResponse.ok(ruleService.getAllRules()));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single detection rule details")
    public ResponseEntity<ApiResponse<DetectionRule>> getRuleById(@PathVariable Long id) {
        return ResponseEntity.ok(ApiResponse.ok(ruleService.getRuleById(id)));
    }

    @PostMapping
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Create a new detection rule (Admin only)")
    public ResponseEntity<ApiResponse<DetectionRule>> createRule(
            @Valid @RequestBody DetectionRule rule,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        DetectionRule created = ruleService.createRule(rule, username);
        return ResponseEntity.ok(ApiResponse.ok("Detection rule created successfully", created));
    }

    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Update an existing detection rule (Admin only)")
    public ResponseEntity<ApiResponse<DetectionRule>> updateRule(
            @PathVariable Long id,
            @Valid @RequestBody DetectionRule rule,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        DetectionRule updated = ruleService.updateRule(id, rule, username);
        return ResponseEntity.ok(ApiResponse.ok("Detection rule updated successfully", updated));
    }

    @PatchMapping("/{id}/toggle")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Enable or disable a detection rule (Admin only)")
    public ResponseEntity<ApiResponse<DetectionRule>> toggleRule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        DetectionRule toggled = ruleService.toggleRule(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Detection rule status updated", toggled));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ADMIN')")
    @Operation(summary = "Delete a detection rule (Admin only)")
    public ResponseEntity<ApiResponse<Void>> deleteRule(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "admin";
        ruleService.deleteRule(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Detection rule deleted successfully", null));
    }
}
