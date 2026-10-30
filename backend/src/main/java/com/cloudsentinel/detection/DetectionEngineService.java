package com.cloudsentinel.detection;

import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.repository.AlertRepository;
import com.cloudsentinel.repository.DetectionRuleRepository;
import com.cloudsentinel.websocket.WebSocketAlertBroadcaster;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;

@Service
public class DetectionEngineService {

    private static final Logger logger = LoggerFactory.getLogger(DetectionEngineService.class);

    @Autowired
    private DetectionRuleRepository ruleRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private List<DetectionRuleEvaluator> evaluators;

    @Autowired
    private WebSocketAlertBroadcaster alertBroadcaster;

    public List<Alert> analyze(SecurityLog log) {
        List<Alert> generatedAlerts = new ArrayList<>();
        List<DetectionRule> activeRules = ruleRepository.findByEnabledTrue();

        for (DetectionRule rule : activeRules) {
            for (DetectionRuleEvaluator evaluator : evaluators) {
                if (evaluator.supports(rule.getConditionType())) {
                    try {
                        Optional<Alert> alertOpt = evaluator.evaluate(log, rule);
                        if (alertOpt.isPresent()) {
                            Alert alert = alertOpt.get();

                            // Duplicate suppression: check if same rule & source IP generated an alert within configurable cooldown
                            int cooldownMinutes = rule.getCooldownMinutes() != null ? rule.getCooldownMinutes() : Math.max(rule.getTimeWindow(), 3);
                            LocalDateTime cooldownCutoff = LocalDateTime.now().minusMinutes(cooldownMinutes);

                            boolean isDuplicate = alertRepository.existsBySourceIpAndRuleIdAndDetectedAtAfter(
                                    alert.getSourceIp(), rule.getId(), cooldownCutoff);

                            if (!isDuplicate) {
                                alert.setRuleId(rule.getId());
                                alert.setRuleName(rule.getRuleName());
                                alert.setLogId(log.getId());
                                alert.setDetectedAt(LocalDateTime.now());

                                Alert savedAlert = alertRepository.save(alert);
                                generatedAlerts.add(savedAlert);

                                logger.info("THREAT DETECTED: [{}] {} - Source IP: {}",
                                        savedAlert.getSeverity(), savedAlert.getTitle(), savedAlert.getSourceIp());

                                // Real-time notification over WebSocket
                                alertBroadcaster.broadcastAlert(savedAlert);
                            } else {
                                logger.debug("Suppressed duplicate alert for rule '{}' from IP {}",
                                        rule.getRuleName(), alert.getSourceIp());
                            }
                        }
                    } catch (Exception ex) {
                        logger.error("Error evaluating rule '{}': {}", rule.getRuleName(), ex.getMessage());
                    }
                }
            }
        }

        return generatedAlerts;
    }
}
