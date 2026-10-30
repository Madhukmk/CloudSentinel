package com.cloudsentinel.detection.evaluators;

import com.cloudsentinel.detection.DetectionRuleEvaluator;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.entity.Severity;
import org.springframework.stereotype.Component;

import java.util.Optional;

@Component
public class CriticalEventRuleEvaluator implements DetectionRuleEvaluator {

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.CRITICAL_EVENT;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        if (currentLog.getSeverity() == Severity.CRITICAL) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Critical Security Incident Ingested");
            alert.setDescription(String.format("Critical severity event received from %s (%s): %s",
                    currentLog.getSourceName(), currentLog.getSourceIp(), currentLog.getMessage()));
            alert.setSeverity(Severity.CRITICAL);
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }
        return Optional.empty();
    }
}
