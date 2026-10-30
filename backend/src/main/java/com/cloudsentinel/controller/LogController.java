package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.LogFilterRequest;
import com.cloudsentinel.dto.LogIngestRequest;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.service.LogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/logs")
@Tag(name = "Logs Management", description = "Ingest and search security logs")
public class LogController {

    @Autowired
    private LogService logService;

    @PostMapping
    @Operation(summary = "Ingest a new raw or normalized security log event")
    public ResponseEntity<ApiResponse<SecurityLog>> ingestLog(@Valid @RequestBody LogIngestRequest request) {
        SecurityLog ingested = logService.ingestLog(request);
        return ResponseEntity.ok(ApiResponse.ok("Security event ingested and evaluated successfully", ingested));
    }

    @GetMapping
    @Operation(summary = "Filter and search security logs with pagination")
    public ResponseEntity<ApiResponse<Page<SecurityLog>>> getLogs(
            @RequestParam(required = false) String keyword,
            @RequestParam(required = false) String severity,
            @RequestParam(required = false) Long sourceId,
            @RequestParam(required = false) String eventType,
            @RequestParam(required = false) String sourceIp,
            @RequestParam(required = false) String action,
            @RequestParam(required = false) String startDate,
            @RequestParam(required = false) String endDate,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        LogFilterRequest filter = new LogFilterRequest();
        filter.setKeyword(keyword);
        filter.setSeverity(severity);
        filter.setSourceId(sourceId);
        filter.setEventType(eventType);
        filter.setSourceIp(sourceIp);
        filter.setAction(action);
        filter.setStartDate(startDate);
        filter.setEndDate(endDate);
        filter.setPage(page);
        filter.setSize(size);

        Page<SecurityLog> logs = logService.getLogs(filter);
        return ResponseEntity.ok(ApiResponse.ok(logs));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single security log details with raw and normalized payload")
    public ResponseEntity<ApiResponse<SecurityLog>> getLogById(@PathVariable Long id) {
        SecurityLog log = logService.getLogById(id);
        return ResponseEntity.ok(ApiResponse.ok(log));
    }
}
