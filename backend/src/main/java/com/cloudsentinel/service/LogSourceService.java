package com.cloudsentinel.service;

import com.cloudsentinel.entity.LogSource;
import com.cloudsentinel.entity.SourceStatus;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.LogSourceRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class LogSourceService {

    @Autowired
    private LogSourceRepository sourceRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<LogSource> getAllSources() {
        return sourceRepository.findAll();
    }

    @Transactional(readOnly = true)
    public LogSource getSourceById(Long id) {
        return sourceRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Log source not found with id: " + id));
    }

    @Transactional
    public LogSource createSource(LogSource source, String username) {
        source.setCreatedAt(LocalDateTime.now());
        source.setLastSeenAt(LocalDateTime.now());
        if (source.getStatus() == null) {
            source.setStatus(SourceStatus.ACTIVE);
        }
        LogSource saved = sourceRepository.save(source);
        auditLogService.logAction(null, username, "CREATE_LOG_SOURCE",
                String.format("Created log source '%s' (IP: %s)", saved.getName(), saved.getIpAddress()), null);
        return saved;
    }

    @Transactional
    public LogSource updateSource(Long id, LogSource updated, String username) {
        LogSource existing = getSourceById(id);
        existing.setName(updated.getName());
        existing.setSourceType(updated.getSourceType());
        existing.setIpAddress(updated.getIpAddress());
        existing.setHostname(updated.getHostname());
        existing.setDescription(updated.getDescription());
        if (updated.getStatus() != null) {
            existing.setStatus(updated.getStatus());
        }

        LogSource saved = sourceRepository.save(existing);
        auditLogService.logAction(null, username, "UPDATE_LOG_SOURCE",
                String.format("Updated log source '%s' (#%d)", saved.getName(), id), null);
        return saved;
    }

    @Transactional
    public LogSource toggleStatus(Long id, String username) {
        LogSource existing = getSourceById(id);
        existing.setStatus(existing.getStatus() == SourceStatus.ACTIVE ? SourceStatus.INACTIVE : SourceStatus.ACTIVE);
        LogSource saved = sourceRepository.save(existing);
        auditLogService.logAction(null, username, "TOGGLE_LOG_SOURCE",
                String.format("Toggled log source '%s' status to %s", saved.getName(), saved.getStatus()), null);
        return saved;
    }

    @Transactional
    public void deleteSource(Long id, String username) {
        LogSource source = getSourceById(id);
        sourceRepository.delete(source);
        auditLogService.logAction(null, username, "DELETE_LOG_SOURCE",
                String.format("Deleted log source '%s' (#%d)", source.getName(), id), null);
    }
}
