package com.cloudsentinel;

import com.cloudsentinel.detection.evaluators.BruteForceRuleEvaluator;
import com.cloudsentinel.detection.evaluators.CorrelationRuleEvaluator;
import com.cloudsentinel.detection.evaluators.CriticalEventRuleEvaluator;
import com.cloudsentinel.detection.evaluators.SuspiciousPortRuleEvaluator;
import com.cloudsentinel.entity.*;
import com.cloudsentinel.repository.SecurityLogRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;

import java.time.LocalDateTime;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
public class DetectionEngineTest {

    @Mock
    private SecurityLogRepository securityLogRepository;

    @InjectMocks
    private BruteForceRuleEvaluator bruteForceRuleEvaluator;

    @InjectMocks
    private CorrelationRuleEvaluator correlationRuleEvaluator;

    private CriticalEventRuleEvaluator criticalEventRuleEvaluator;
    private SuspiciousPortRuleEvaluator suspiciousPortRuleEvaluator;

    @BeforeEach
    void setUp() {
        criticalEventRuleEvaluator = new CriticalEventRuleEvaluator();
        suspiciousPortRuleEvaluator = new SuspiciousPortRuleEvaluator();
    }

    @Test
    @DisplayName("Brute Force Detection: Below threshold (4 attempts) generates NO alert")
    void testBruteForceBelowThreshold() {
        DetectionRule rule = new DetectionRule("Brute Force", "Test rule", "LOGIN",
                ConditionType.FAILED_LOGINS, 5, 5, Severity.HIGH, true);
        rule.setId(1L);

        SecurityLog log = new SecurityLog();
        log.setSourceIp("192.168.1.50");
        log.setAction("LOGIN_FAILED");
        log.setTimestamp(LocalDateTime.now());

        when(securityLogRepository.countBySourceIpAndActionAndTimestampAfter(eq("192.168.1.50"), eq("LOGIN_FAILED"), any()))
                .thenReturn(4L);

        Optional<Alert> alert = bruteForceRuleEvaluator.evaluate(log, rule);
        assertFalse(alert.isPresent(), "Expected no alert when failed attempts < threshold");
    }

    @Test
    @DisplayName("Brute Force Detection: At or above threshold (6 attempts) generates HIGH severity alert")
    void testBruteForceAtOrAboveThreshold() {
        DetectionRule rule = new DetectionRule("Brute Force", "Test rule", "LOGIN",
                ConditionType.FAILED_LOGINS, 5, 5, Severity.HIGH, true);
        rule.setId(1L);

        SecurityLog log = new SecurityLog();
        log.setId(101L);
        log.setSourceIp("192.168.1.50");
        log.setAction("LOGIN_FAILED");
        log.setTimestamp(LocalDateTime.now());

        when(securityLogRepository.countBySourceIpAndActionAndTimestampAfter(eq("192.168.1.50"), eq("LOGIN_FAILED"), any()))
                .thenReturn(6L);

        Optional<Alert> alertOpt = bruteForceRuleEvaluator.evaluate(log, rule);
        assertTrue(alertOpt.isPresent(), "Expected HIGH alert when failed attempts >= threshold");

        Alert alert = alertOpt.get();
        assertEquals(Severity.HIGH, alert.getSeverity());
        assertEquals("Possible Brute Force Attack", alert.getTitle());
        assertEquals("192.168.1.50", alert.getSourceIp());
    }

    @Test
    @DisplayName("Event Correlation: 5 failed attempts followed by SUCCESS generates CRITICAL correlation alert")
    void testCorrelationAttack() {
        DetectionRule rule = new DetectionRule("Brute Force Breach", "Correlation rule", "LOGIN",
                ConditionType.CORRELATION, 5, 5, Severity.CRITICAL, true);
        rule.setId(2L);

        SecurityLog successLog = new SecurityLog();
        successLog.setId(202L);
        successLog.setSourceIp("10.0.5.20");
        successLog.setUsername("admin");
        successLog.setAction("LOGIN_SUCCESS");
        successLog.setTimestamp(LocalDateTime.now());

        when(securityLogRepository.countBySourceIpAndActionAndTimestampAfter(eq("10.0.5.20"), eq("LOGIN_FAILED"), any()))
                .thenReturn(6L);

        Optional<Alert> alertOpt = correlationRuleEvaluator.evaluate(successLog, rule);
        assertTrue(alertOpt.isPresent(), "Expected correlation alert upon successful login following failures");

        Alert alert = alertOpt.get();
        assertEquals(Severity.CRITICAL, alert.getSeverity());
        assertTrue(alert.getTitle().contains("Successful Login"));
    }

    @Test
    @DisplayName("Suspicious Port Detection: RDP port 3389 access generates alert")
    void testSuspiciousPortDetection() {
        DetectionRule rule = new DetectionRule("Suspicious Port", "Port rule", "PORT_ACCESS",
                ConditionType.SUSPICIOUS_PORT, 1, 5, Severity.HIGH, true);
        rule.setId(3L);

        SecurityLog portLog = new SecurityLog();
        portLog.setId(303L);
        portLog.setSourceIp("203.0.113.5");
        portLog.setPort(3389);
        portLog.setEventType("PORT_ACCESS");

        Optional<Alert> alertOpt = suspiciousPortRuleEvaluator.evaluate(portLog, rule);
        assertTrue(alertOpt.isPresent());
        assertTrue(alertOpt.get().getDescription().contains("RDP"));
    }

    @Test
    @DisplayName("Critical Event Detection: Immediate CRITICAL alert generated")
    void testCriticalEventImmediateAlert() {
        DetectionRule rule = new DetectionRule("Critical Alert", "Critical rule", "ALL",
                ConditionType.CRITICAL_EVENT, 1, 1, Severity.CRITICAL, true);
        rule.setId(4L);

        SecurityLog critLog = new SecurityLog();
        critLog.setId(404L);
        critLog.setSeverity(Severity.CRITICAL);
        critLog.setMessage("Ransomware payload detected on disk");
        critLog.setSourceIp("192.168.1.99");
        critLog.setSourceName("Endpoint Protection");

        Optional<Alert> alertOpt = criticalEventRuleEvaluator.evaluate(critLog, rule);
        assertTrue(alertOpt.isPresent());
        assertEquals(Severity.CRITICAL, alertOpt.get().getSeverity());
    }
}
