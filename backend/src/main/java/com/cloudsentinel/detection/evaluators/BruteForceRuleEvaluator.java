package com.cloudsentinel.detection.evaluators;

import com.cloudsentinel.detection.DetectionRuleEvaluator;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.repository.SecurityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class BruteForceRuleEvaluator implements DetectionRuleEvaluator {

    @Autowired
    private SecurityLogRepository securityLogRepository;

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.FAILED_LOGINS;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        // Only evaluate if the current action is a failed login
        if (!"LOGIN_FAILED".equalsIgnoreCase(currentLog.getAction())) {
            return Optional.empty();
        }

        int windowMinutes = rule.getTimeWindow() > 0 ? rule.getTimeWindow() : 5;
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

        long failedCount = securityLogRepository.countBySourceIpAndActionAndTimestampAfter(
                currentLog.getSourceIp(), "LOGIN_FAILED", windowStart);

        if (failedCount >= rule.getThreshold()) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Possible Brute Force Attack");
            alert.setDescription(String.format("Detected %d failed login attempts from IP %s within %d minutes (Threshold: %d)",
                    failedCount, currentLog.getSourceIp(), windowMinutes, rule.getThreshold()));
            alert.setSeverity(rule.getSeverity());
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }

        return Optional.empty();
    }
}
