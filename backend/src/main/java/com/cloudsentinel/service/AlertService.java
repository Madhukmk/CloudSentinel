package com.cloudsentinel.service;

import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.AlertStatus;
import com.cloudsentinel.entity.Severity;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.AlertRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AlertService {

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<Alert> getAlerts(AlertStatus status, Severity severity, Pageable pageable) {
        return getAlerts(status, severity, null, pageable);
    }

    @Transactional(readOnly = true)
    public Page<Alert> getAlerts(AlertStatus status, Severity severity, String sourceIp, Pageable pageable) {
        if (sourceIp != null && !sourceIp.trim().isEmpty()) {
            return alertRepository.findBySourceIp(sourceIp.trim(), pageable);
        }
        if (status != null && severity != null) {
            return alertRepository.findByStatusAndSeverity(status, severity, pageable);
        } else if (status != null) {
            return alertRepository.findByStatus(status, pageable);
        } else if (severity != null) {
            return alertRepository.findBySeverity(severity, pageable);
        }
        return alertRepository.findAllByOrderByDetectedAtDesc(pageable);
    }

    @Transactional
    public java.util.List<Alert> bulkUpdateStatus(java.util.List<Long> ids, AlertStatus status, String username) {
        java.util.List<Alert> updated = new java.util.ArrayList<>();
        if (ids != null) {
            for (Long id : ids) {
                try {
                    updated.add(updateStatus(id, status, username));
                } catch (Exception ignored) {}
            }
        }
        return updated;
    }

    @Transactional(readOnly = true)
    public Alert getAlertById(Long id) {
        return alertRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Alert not found with id: " + id));
    }

    @Transactional
    public Alert updateStatus(Long id, AlertStatus status, String username) {
        Alert alert = getAlertById(id);
        alert.setStatus(status);

        if (status == AlertStatus.ACKNOWLEDGED) {
            alert.setAcknowledgedAt(LocalDateTime.now());
            alert.setAcknowledgedBy(username);
        } else if (status == AlertStatus.RESOLVED || status == AlertStatus.FALSE_POSITIVE) {
            alert.setResolvedAt(LocalDateTime.now());
            if (alert.getAcknowledgedBy() == null) {
                alert.setAcknowledgedBy(username);
                alert.setAcknowledgedAt(LocalDateTime.now());
            }
        }

        Alert saved = alertRepository.save(alert);
        auditLogService.logAction(null, username, "UPDATE_ALERT_STATUS",
                String.format("Alert #%d status updated to %s", id, status), null);
        return saved;
    }

    @Transactional
    public Alert acknowledgeAlert(Long id, String username) {
        return updateStatus(id, AlertStatus.ACKNOWLEDGED, username);
    }

    @Transactional
    public Alert resolveAlert(Long id, String username) {
        return updateStatus(id, AlertStatus.RESOLVED, username);
    }

    @Transactional
    public Alert markFalsePositive(Long id, String username) {
        return updateStatus(id, AlertStatus.FALSE_POSITIVE, username);
    }
}
