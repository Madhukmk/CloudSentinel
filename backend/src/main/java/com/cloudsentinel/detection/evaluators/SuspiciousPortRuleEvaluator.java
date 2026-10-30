package com.cloudsentinel.detection.evaluators;

import com.cloudsentinel.detection.DetectionRuleEvaluator;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.ConditionType;
import com.cloudsentinel.entity.DetectionRule;
import com.cloudsentinel.entity.SecurityLog;
import org.springframework.stereotype.Component;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

@Component
public class SuspiciousPortRuleEvaluator implements DetectionRuleEvaluator {

    private static final List<Integer> HIGH_RISK_PORTS = Arrays.asList(22, 23, 1433, 3389, 4444, 4445, 5900, 6667);

    @Override
    public boolean supports(ConditionType conditionType) {
        return conditionType == ConditionType.SUSPICIOUS_PORT;
    }

    @Override
    public Optional<Alert> evaluate(SecurityLog currentLog, DetectionRule rule) {
        if (currentLog.getPort() == null) {
            return Optional.empty();
        }

        int port = currentLog.getPort();
        if (HIGH_RISK_PORTS.contains(port) || "PORT_ACCESS".equalsIgnoreCase(currentLog.getEventType()) || "SUSPICIOUS_PORT_ACCESS".equalsIgnoreCase(currentLog.getAction())) {
            Alert alert = new Alert();
            alert.setRuleId(rule.getId());
            alert.setRuleName(rule.getRuleName());
            alert.setLogId(currentLog.getId());
            alert.setTitle("Suspicious Port Access Detected");
            alert.setDescription(String.format("Traffic detected to high-risk port %d (%s) from source IP %s to destination IP %s",
                    port, resolvePortService(port), currentLog.getSourceIp(), currentLog.getDestinationIp()));
            alert.setSeverity(rule.getSeverity());
            alert.setSourceIp(currentLog.getSourceIp());
            return Optional.of(alert);
        }

        return Optional.empty();
    }

    private String resolvePortService(int port) {
        return switch (port) {
            case 22 -> "SSH";
            case 23 -> "Telnet";
            case 1433 -> "MS-SQL";
            case 3389 -> "RDP (Remote Desktop)";
            case 4444, 4445 -> "Metasploit / Reverse Shell";
            case 5900 -> "VNC";
            case 6667 -> "IRC Botnet";
            default -> "Port " + port;
        };
    }
}
