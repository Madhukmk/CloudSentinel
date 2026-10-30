package com.cloudsentinel.detection.evaluators;

import com.cloudsentinel.detection.DetectionRuleEvaluator;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.entity.Severity;
import com.cloudsentinel.repository.SecurityLogRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.Optional;

@Component
public class CorrelationRuleEvaluator implements DetectionRuleEvaluator {

    @Autowired
    private SecurityLogRepository securityLogRepository;

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.CORRELATION;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        // Trigger correlation evaluation when a successful login occurs
        if (!"LOGIN_SUCCESS".equalsIgnoreCase(currentLog.getAction())) {
            return Optional.empty();
        }

        int windowMinutes = rule.getTimeWindow() > 0 ? rule.getTimeWindow() : 5;
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

        // Check how many failed logins preceded this success from the same IP
        long precedingFailures = securityLogRepository.countBySourceIpAndActionAndTimestampAfter(
                currentLog.getSourceIp(), "LOGIN_FAILED", windowStart);

        int threshold = rule.getThreshold() > 0 ? rule.getThreshold() : 5;

        if (precedingFailures >= threshold) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Possible Brute Force Attack Followed by Successful Login");
            alert.setDescription(String.format(
                    "CRITICAL CORRELATION: %d failed login attempts immediately followed by a successful login for user '%s' from IP %s within %d minutes. Possible account takeover!",
                    precedingFailures, currentLog.getUsername(), currentLog.getSourceIp(), windowMinutes));
            alert.setSeverity(Severity.CRITICAL);
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }

        return Optional.empty();
    }
}
