package com.cloudsentinel.service;

import com.cloudsentinel.dto.LogIngestRequest;
import com.cloudsentinel.entity.SecurityLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Map;

@Service
public class DemoSimulationService {

    private static final Logger logger = LoggerFactory.getLogger(DemoSimulationService.class);

    @Autowired
    private LogService logService;

    public Map<String, Object> simulateBruteForce(String customIp) {
        String targetIp = (customIp != null && !customIp.isBlank()) ? customIp : "192.168.1.105";
        logger.info("Executing Controlled SIEM Demo: Simulating 6 rapid failed logins from {}", targetIp);

        List<SecurityLog> ingestedLogs = new ArrayList<>();

        for (int i = 1; i <= 6; i++) {
            LogIngestRequest req = new LogIngestRequest();
            req.setSourceId(1L);
            req.setSourceName("Edge Authentication Gateway");
            req.setSourceIp(targetIp);
            req.setDestinationIp("10.0.1.10");
            req.setUsername("admin");
            req.setEventType("LOGIN");
            req.setAction("LOGIN_FAILED");
            req.setSeverity("MEDIUM");
            req.setMessage("Failed login attempt " + i + " of 6 for user 'admin' - Invalid password credentials");
            req.setProtocol("HTTPS");
            req.setPort(443);
            req.setTimestamp(LocalDateTime.now().minusSeconds(60 - (i * 10)).toString());

            SecurityLog saved = logService.ingestLog(req);
            ingestedLogs.add(saved);
        }

        return Map.of(
                "status", "SUCCESS",
                "attackType", "Brute Force Authentication Attack",
                "simulatedSourceIp", targetIp,
                "eventsGenerated", ingestedLogs.size(),
                "message", "Generated 6 failed login events. Detection Engine evaluated rules and triggered High-Severity Brute Force Alert!"
        );
    }

    public Map<String, Object> simulatePortScan(String customIp) {
        String targetIp = (customIp != null && !customIp.isBlank()) ? customIp : "10.10.4.52";
        logger.info("Executing Controlled SIEM Demo: Simulating port scan probes from {}", targetIp);

        int[] ports = {22, 23, 3389, 4444};
        List<SecurityLog> ingestedLogs = new ArrayList<>();

        for (int port : ports) {
            LogIngestRequest req = new LogIngestRequest();
            req.setSourceId(3L);
            req.setSourceName("Perimeter Firewall Cluster");
            req.setSourceIp(targetIp);
            req.setDestinationIp("10.0.0.15");
            req.setUsername("anonymous");
            req.setEventType("PORT_ACCESS");
            req.setAction("SUSPICIOUS_PORT_ACCESS");
            req.setSeverity("HIGH");
            req.setMessage("Port sweep detected attempting connection to restricted port " + port);
            req.setProtocol("TCP");
            req.setPort(port);
            req.setTimestamp(LocalDateTime.now().toString());

            SecurityLog saved = logService.ingestLog(req);
            ingestedLogs.add(saved);
        }

        return Map.of(
                "status", "SUCCESS",
                "attackType", "Reconnaissance Port Sweep",
                "simulatedSourceIp", targetIp,
                "eventsGenerated", ingestedLogs.size(),
                "message", "Generated 4 suspicious port access events across high-risk service ports."
        );
    }

    public Map<String, Object> simulateCorrelationAttack(String customIp) {
        String targetIp = (customIp != null && !customIp.isBlank()) ? customIp : "172.16.8.99";
        logger.info("Executing Controlled SIEM Demo: Simulating 5 failed logins followed by SUCCESS from {}", targetIp);

        // 1. Five failed logins
        for (int i = 1; i <= 5; i++) {
            LogIngestRequest req = new LogIngestRequest();
            req.setSourceId(1L);
            req.setSourceName("Edge Authentication Gateway");
            req.setSourceIp(targetIp);
            req.setDestinationIp("10.0.1.10");
            req.setUsername("root");
            req.setEventType("LOGIN");
            req.setAction("LOGIN_FAILED");
            req.setSeverity("HIGH");
            req.setMessage("Credential guess attempt #" + i + " failed for account 'root'");
            req.setProtocol("SSH");
            req.setPort(22);
            req.setTimestamp(LocalDateTime.now().minusSeconds(30 - (i * 5)).toString());
            logService.ingestLog(req);
        }

        // 2. One successful login from the same IP
        LogIngestRequest successReq = new LogIngestRequest();
        successReq.setSourceId(1L);
        successReq.setSourceName("Edge Authentication Gateway");
        successReq.setSourceIp(targetIp);
        successReq.setDestinationIp("10.0.1.10");
        successReq.setUsername("root");
        successReq.setEventType("LOGIN");
        successReq.setAction("LOGIN_SUCCESS");
        successReq.setSeverity("CRITICAL");
        successReq.setMessage("Interactive SSH login successful for 'root' after repeated failures");
        successReq.setProtocol("SSH");
        successReq.setPort(22);
        successReq.setTimestamp(LocalDateTime.now().toString());

        logService.ingestLog(successReq);

        return Map.of(
                "status", "SUCCESS",
                "attackType", "Brute Force Followed by Compromise (Correlation)",
                "simulatedSourceIp", targetIp,
                "eventsGenerated", 6,
                "message", "Simulated 5 failures followed by a successful login. Detection Engine triggered a CRITICAL correlation alert!"
        );
    }
}
