package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.entity.AuditLog;
import com.cloudsentinel.service.AuditLogService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/audit-logs")
@PreAuthorize("hasRole('ADMIN')")
@Tag(name = "Audit Logs", description = "Admin-only endpoints for reviewing system audit trails")
public class AuditLogController {

    @Autowired
    private AuditLogService auditLogService;

    @GetMapping
    @Operation(summary = "Get paginated audit logs of administrative actions with optional user and action filtering")
    public ResponseEntity<ApiResponse<Page<AuditLog>>> getAuditLogs(
            @RequestParam(required = false) String username,
            @RequestParam(required = false) String action,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<AuditLog> auditLogs = auditLogService.getAuditLogs(username, action, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp")));
        return ResponseEntity.ok(ApiResponse.ok(auditLogs));
    }
}
