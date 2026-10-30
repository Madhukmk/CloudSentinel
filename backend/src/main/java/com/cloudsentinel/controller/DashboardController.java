package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.DashboardStatsDto;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.service.DashboardService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/dashboard")
@Tag(name = "SOC Dashboard", description = "Endpoints for SOC dashboard metrics, telemetry charts, and live activity")
public class DashboardController {

    @Autowired
    private DashboardService dashboardService;

    @GetMapping("/stats")
    @Operation(summary = "Get high-level SOC dashboard KPI statistics")
    public ResponseEntity<ApiResponse<DashboardStatsDto>> getStats() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getStats()));
    }

    @GetMapping("/events-over-time")
    @Operation(summary = "Get events distribution over time for trend line/area charts (supports range=1h|6h|24h|7d)")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEventsOverTime(
            @RequestParam(defaultValue = "24h") String range
    ) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getEventsOverTime(range)));
    }

    @GetMapping("/detection-activity")
    @Operation(summary = "Get detection rule trigger activity metrics")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getDetectionActivity() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getDetectionActivity()));
    }

    @GetMapping("/search")
    @Operation(summary = "Cross-entity global search across logs, alerts, incidents, rules, and log sources")
    public ResponseEntity<ApiResponse<Map<String, Object>>> search(
            @RequestParam(required = false, defaultValue = "") String q
    ) {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.search(q)));
    }

    @GetMapping("/alerts-by-severity")
    @Operation(summary = "Get alert distribution grouped by severity")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getAlertsBySeverity() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getAlertsBySeverity()));
    }

    @GetMapping("/logs-by-source")
    @Operation(summary = "Get volume of logs grouped by originating source device")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getLogsBySource() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getLogsBySource()));
    }

    @GetMapping("/top-source-ips")
    @Operation(summary = "Get top source IP addresses generating events")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getTopSourceIps() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getTopSourceIps()));
    }

    @GetMapping("/event-types")
    @Operation(summary = "Get distribution of event types")
    public ResponseEntity<ApiResponse<List<Map<String, Object>>>> getEventTypes() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getEventTypes()));
    }

    @GetMapping("/recent-alerts")
    @Operation(summary = "Get top 10 most recent alerts")
    public ResponseEntity<ApiResponse<List<Alert>>> getRecentAlerts() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentAlerts()));
    }

    @GetMapping("/recent-logs")
    @Operation(summary = "Get top 10 most recent security logs")
    public ResponseEntity<ApiResponse<List<SecurityLog>>> getRecentLogs() {
        return ResponseEntity.ok(ApiResponse.ok(dashboardService.getRecentLogs()));
    }
}
