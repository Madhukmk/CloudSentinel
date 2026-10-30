package com.cloudsentinel.service;

import com.cloudsentinel.entity.AuditLog;
import com.cloudsentinel.repository.AuditLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuditLogService {

    @Autowired
    private AuditLogRepository auditLogRepository;

    @Transactional
    public void logAction(Long userId, String username, String action, String description, String ipAddress) {
        try {
            AuditLog audit = new AuditLog(userId, username != null ? username : "system",
                    action, description, ipAddress != null ? ipAddress : "127.0.0.1");
            audit.setTimestamp(LocalDateTime.now());
            auditLogRepository.save(audit);
        } catch (Exception ex) {
            // Never fail outer transaction if audit logging fails
        }
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(Pageable pageable) {
        return getAuditLogs(null, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<AuditLog> getAuditLogs(String username, String action, Pageable pageable) {
        boolean hasUser = username != null && !username.trim().isEmpty();
        boolean hasAction = action != null && !action.trim().isEmpty();
        if (hasUser && hasAction) {
            return auditLogRepository.findByUsernameContainingIgnoreCaseAndActionContainingIgnoreCaseOrderByTimestampDesc(username.trim(), action.trim(), pageable);
        } else if (hasUser) {
            return auditLogRepository.findByUsernameContainingIgnoreCaseOrderByTimestampDesc(username.trim(), pageable);
        } else if (hasAction) {
            return auditLogRepository.findByActionContainingIgnoreCaseOrderByTimestampDesc(action.trim(), pageable);
        }
        return auditLogRepository.findAllByOrderByTimestampDesc(pageable);
    }
}
