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
public class RepeatedEventRuleEvaluator implements DetectionRuleEvaluator {

    @Autowired
    private SecurityLogRepository securityLogRepository;

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.REPEATED_EVENT;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        int windowMinutes = rule.getTimeWindow() > 0 ? rule.getTimeWindow() : 10;
        LocalDateTime windowStart = LocalDateTime.now().minusMinutes(windowMinutes);

        long eventCount = securityLogRepository.countBySourceIpAndEventTypeAndTimestampAfter(
                currentLog.getSourceIp(), currentLog.getEventType(), windowStart);

        if (eventCount >= rule.getThreshold()) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Excessive Event Rate: " + currentLog.getEventType());
            alert.setDescription(String.format("High frequency of '%s' events (%d events in %d min) originating from source IP %s",
                    currentLog.getEventType(), eventCount, windowMinutes, currentLog.getSourceIp()));
            alert.setSeverity(rule.getSeverity());
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }

        return Optional.empty();
    }
}
