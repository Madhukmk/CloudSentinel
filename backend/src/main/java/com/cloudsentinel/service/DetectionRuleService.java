package com.cloudsentinel.service;

import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.DetectionRuleRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class DetectionRuleService {

    @Autowired
    private DetectionRuleRepository ruleRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public List<DetectionRule> getAllRules() {
        return ruleRepository.findAll();
    }

    @Transactional(readOnly = true)
    public DetectionRule getRuleById(Long id) {
        return ruleRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Detection rule not found with id: " + id));
    }

    @Transactional
    public DetectionRule createRule(DetectionRule rule, String username) {
        rule.setCreatedAt(LocalDateTime.now());
        rule.setUpdatedAt(LocalDateTime.now());
        DetectionRule saved = ruleRepository.save(rule);
        auditLogService.logAction(null, username, "CREATE_RULE",
                String.format("Created detection rule '%s'", saved.getRuleName()), null);
        return saved;
    }

    @Transactional
    public DetectionRule updateRule(Long id, DetectionRule updated, String username) {
        DetectionRule existing = getRuleById(id);
        existing.setRuleName(updated.getRuleName());
        existing.setDescription(updated.getDescription());
        existing.setEventType(updated.getEventType());
        existing.setConditionType(updated.getConditionType());
        existing.setThreshold(updated.getThreshold());
        existing.setTimeWindow(updated.getTimeWindow());
        existing.setSeverity(updated.getSeverity());
        existing.setEnabled(updated.isEnabled());
        existing.setUpdatedAt(LocalDateTime.now());

        DetectionRule saved = ruleRepository.save(existing);
        auditLogService.logAction(null, username, "UPDATE_RULE",
                String.format("Updated detection rule '%s' (#%d)", saved.getRuleName(), id), null);
        return saved;
    }

    @Transactional
    public DetectionRule toggleRule(Long id, String username) {
        DetectionRule existing = getRuleById(id);
        existing.setEnabled(!existing.isEnabled());
        existing.setUpdatedAt(LocalDateTime.now());
        DetectionRule saved = ruleRepository.save(existing);
        auditLogService.logAction(null, username, "TOGGLE_RULE",
                String.format("Toggled rule '%s' to %s", saved.getRuleName(), saved.isEnabled() ? "ENABLED" : "DISABLED"), null);
        return saved;
    }

    @Transactional
    public void deleteRule(Long id, String username) {
        DetectionRule rule = getRuleById(id);
        ruleRepository.delete(rule);
        auditLogService.logAction(null, username, "DELETE_RULE",
                String.format("Deleted detection rule '%s' (#%d)", rule.getRuleName(), id), null);
    }
}
