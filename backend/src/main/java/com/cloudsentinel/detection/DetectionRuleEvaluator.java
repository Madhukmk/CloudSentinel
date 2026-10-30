package com.cloudsentinel.detection;

import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;

import java.util.Optional;

public interface DetectionRuleEvaluator {
    boolean supports(ConditionType conditionType);
    Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule);
}
