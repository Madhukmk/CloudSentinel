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
public class RepeatedLoginRuleEvaluator implements DetectionRuleEvaluator {

    @Autowired
    private SecurityLogRepository securityLogRepository;

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.FAILED_LOGINS_SAME_USER;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        if (!"LOGIN_FAILED".equalsIgnoreCase(currentLog.getAction()) || "anonymous".equalsIgnoreCase(currentLog.getUsername())) {
            return Optional.empty();
        }

        int windowMinutes = rule.getTimeWindow() > 0 ? rule.getTimeWindow() : 5;
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

        long failedCount = securityLogRepository.countByUsernameAndActionAndTimestampAfter(
                currentLog.getUsername(), "LOGIN_FAILED", windowStart);

        if (failedCount >= rule.getThreshold()) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Account Targeted: Repeated Failed Logins");
            alert.setDescription(String.format("Detected %d failed login attempts targeting username '%s' within %d minutes",
                    failedCount, currentLog.getUsername(), windowMinutes));
            alert.setSeverity(rule.getSeverity());
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }

        return Optional.empty();
    }
}
