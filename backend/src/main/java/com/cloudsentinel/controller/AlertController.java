package com.cloudsentinel.controller;

import com.cloudsentinel.dto.AlertStatusUpdateRequest;
import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.AlertStatus;
import com.cloudsentinel.entity.Severity;
import com.cloudsentinel.service.AlertService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/alerts")
@Tag(name = "Alerts Management", description = "Endpoints for alert monitoring, triage, and resolution")
public class AlertController {

    @Autowired
    private AlertService alertService;

    @GetMapping
    @Operation(summary = "Get paginated security alerts with optional status, severity, and sourceIp filtering")
    public ResponseEntity<ApiResponse<Page<Alert>>> getAlerts(
            @RequestParam(required = false) AlertStatus status,
            @RequestParam(required = false) Severity severity,
            @RequestParam(required = false) String sourceIp,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<Alert> alerts = alertService.getAlerts(status, severity, sourceIp, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "detectedAt")));
        return ResponseEntity.ok(ApiResponse.ok(alerts));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get alert details by ID")
    public ResponseEntity<ApiResponse<Alert>> getAlertById(@PathVariable Long id) {
        Alert alert = alertService.getAlertById(id);
        return ResponseEntity.ok(ApiResponse.ok(alert));
    }

    @PutMapping("/{id}/acknowledge")
    @Operation(summary = "Mark alert as Acknowledged")
    public ResponseEntity<ApiResponse<Alert>> acknowledgeAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        Alert alert = alertService.acknowledgeAlert(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Alert acknowledged successfully", alert));
    }

    @PutMapping("/{id}/resolve")
    @Operation(summary = "Mark alert as Resolved")
    public ResponseEntity<ApiResponse<Alert>> resolveAlert(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        Alert alert = alertService.resolveAlert(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Alert marked as resolved", alert));
    }

    @PutMapping("/{id}/false-positive")
    @Operation(summary = "Mark alert as False Positive")
    public ResponseEntity<ApiResponse<Alert>> markFalsePositive(
            @PathVariable Long id,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        Alert alert = alertService.markFalsePositive(id, username);
        return ResponseEntity.ok(ApiResponse.ok("Alert marked as false positive", alert));
    }

    @PutMapping("/{id}/status")
    @Operation(summary = "Update alert status")
    public ResponseEntity<ApiResponse<Alert>> updateStatus(
            @PathVariable Long id,
            @RequestBody AlertStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        Alert alert = alertService.updateStatus(id, request.getStatus(), username);
        return ResponseEntity.ok(ApiResponse.ok("Alert status updated", alert));
    }

    @PostMapping("/bulk/acknowledge")
    @Operation(summary = "Bulk acknowledge alerts by ID list")
    public ResponseEntity<ApiResponse<java.util.List<Alert>>> bulkAcknowledge(
            @RequestBody java.util.List<Long> ids,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        java.util.List<Alert> alerts = alertService.bulkUpdateStatus(ids, AlertStatus.ACKNOWLEDGED, username);
        return ResponseEntity.ok(ApiResponse.ok("Alerts acknowledged successfully", alerts));
    }

    @PostMapping("/bulk/resolve")
    @Operation(summary = "Bulk resolve alerts by ID list")
    public ResponseEntity<ApiResponse<java.util.List<Alert>>> bulkResolve(
            @RequestBody java.util.List<Long> ids,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        java.util.List<Alert> alerts = alertService.bulkUpdateStatus(ids, AlertStatus.RESOLVED, username);
        return ResponseEntity.ok(ApiResponse.ok("Alerts resolved successfully", alerts));
    }
}
