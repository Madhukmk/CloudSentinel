package com.cloudsentinel.config;

import com.cloudsentinel.entity.*;
import com.cloudsentinel.repository.*;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDateTime;
import java.util.*;

@Component
public class DataInitializer implements CommandLineRunner {

    private static final Logger logger = LoggerFactory.getLogger(DataInitializer.class);

    @Autowired
    private UserRepository userRepository;

    @Autowired
    private LogSourceRepository sourceRepository;

    @Autowired
    private DetectionRuleRepository ruleRepository;

    @Autowired
    private SecurityLogRepository logRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private IncidentNoteRepository incidentNoteRepository;

    @Autowired
    private PasswordEncoder passwordEncoder;

    @Autowired
    private ObjectMapper objectMapper;

    @Override
    public void run(String... args) throws Exception {
        seedUsers();
        seedLogSources();
        seedDetectionRules();
        seedSecurityLogs();
        seedAlerts();
        seedIncidents();
        logger.info("CloudSentinel Database Bootstrap completed successfully.");
    }

    private void seedUsers() {
        if (userRepository.count() == 0) {
            logger.info("Seeding initial SOC users...");

            User admin = new User(
                    "SOC Administrator",
                    "admin@cloudsentinel.com",
                    passwordEncoder.encode("Admin@123"),
                    Role.ADMIN
            );
            userRepository.save(admin);

            User analyst = new User(
                    "Senior Security Analyst",
                    "analyst@cloudsentinel.com",
                    passwordEncoder.encode("Analyst@123"),
                    Role.ANALYST
            );
            userRepository.save(analyst);

            logger.info("Created demo users: admin@cloudsentinel.com and analyst@cloudsentinel.com");
        }
    }

    private void seedLogSources() {
        if (sourceRepository.count() == 0) {
            logger.info("Seeding initial log sources...");

            List<LogSource> sources = Arrays.asList(
                    new LogSource("Edge Authentication Gateway", SourceType.APPLICATION, "192.168.1.10", "auth-gw.internal", "Main SSO & Keycloak cluster"),
                    new LogSource("Production Web Server 01", SourceType.SERVER, "192.168.1.20", "web-prod-01.internal", "Public DMZ NGINX Web cluster"),
                    new LogSource("Perimeter Firewall Cluster", SourceType.FIREWALL, "10.0.0.1", "fw-palo-cluster.internal", "Palo Alto edge perimeter firewall"),
                    new LogSource("Core Transaction Database", SourceType.DATABASE, "10.0.2.50", "mysql-core-db.internal", "Primary enterprise relational database"),
                    new LogSource("Branch VPN Gateway", SourceType.NETWORK_DEVICE, "172.16.0.1", "vpn-cisco-core.internal", "Cisco AnyConnect VPN concentrated gateway")
            );

            sourceRepository.saveAll(sources);
        }
    }

    private void seedDetectionRules() {
        if (ruleRepository.count() == 0) {
            logger.info("Seeding detection rules...");

            List<DetectionRule> rules = Arrays.asList(
                    new DetectionRule("Brute Force Login Detection",
                            "More than 5 failed login attempts from the same IP within 5 minutes.",
                            "LOGIN", ConditionType.FAILED_LOGINS, 5, 5, Severity.HIGH, true),

                    new DetectionRule("Targeted Account Credential Stuffing",
                            "More than 5 failed logins targeted against the same username within 5 minutes.",
                            "LOGIN", ConditionType.FAILED_LOGINS_SAME_USER, 5, 5, Severity.HIGH, true),

                    new DetectionRule("Suspicious Port Access Detection",
                            "Detect access attempts to high-risk ports such as SSH (22), Telnet (23), and RDP (3389).",
                            "PORT_ACCESS", ConditionType.SUSPICIOUS_PORT, 1, 5, Severity.HIGH, true),

                    new DetectionRule("Immediate Critical Threat Alert",
                            "Immediate trigger on any incoming security telemetry labeled as CRITICAL severity.",
                            "ALL", ConditionType.CRITICAL_EVENT, 1, 1, Severity.CRITICAL, true),

                    new DetectionRule("Log Flooding & Volumetric Anomaly",
                            "Excessive occurrences of identical event types from the same origin within a short time window.",
                            "ALL", ConditionType.REPEATED_EVENT, 20, 5, Severity.MEDIUM, true),

                    new DetectionRule("Possible Brute Force Attack Followed by Successful Login",
                            "Critical correlation: 5+ failed attempts followed immediately by a successful authentication from the same IP.",
                            "LOGIN", ConditionType.CORRELATION, 5, 5, Severity.CRITICAL, true)
            );

            ruleRepository.saveAll(rules);
        }
    }

    private void seedSecurityLogs() {
        if (logRepository.count() == 0) {
            logger.info("Seeding 50+ realistic security logs...");

            List<SecurityLog> logs = new ArrayList<>();
            LocalDateTime now = LocalDateTime.now();

            String[] ips = {"192.168.1.45", "10.0.1.80", "203.0.113.19", "198.51.100.4", "172.16.5.22", "192.168.1.105"};
            String[] users = {"admin", "analyst", "dbadmin", "root", "guest", "service_account"};

            // Realistic events template
            for (int i = 60; i >= 1; i--) {
                SecurityLog log = new SecurityLog();
                LocalDateTime eventTime = now.minusMinutes(i * 18);
                log.setTimestamp(eventTime);

                int choice = i % 8;
                switch (choice) {
                    case 0 -> {
                        log.setSourceId(1L);
                        log.setSourceName("Edge Authentication Gateway");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("10.0.1.10");
                        log.setUsername(users[i % users.length]);
                        log.setEventType("LOGIN");
                        log.setAction("LOGIN_SUCCESS");
                        log.setSeverity(Severity.LOW);
                        log.setMessage("User successfully authenticated via MFA token");
                        log.setProtocol("HTTPS");
                        log.setPort(443);
                        log.setStatus("SUCCESS");
                    }
                    case 1 -> {
                        log.setSourceId(1L);
                        log.setSourceName("Edge Authentication Gateway");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("10.0.1.10");
                        log.setUsername(users[i % users.length]);
                        log.setEventType("LOGIN");
                        log.setAction("LOGIN_FAILED");
                        log.setSeverity(Severity.MEDIUM);
                        log.setMessage("Authentication failure: Invalid credential hash provided");
                        log.setProtocol("HTTPS");
                        log.setPort(443);
                        log.setStatus("FAILED");
                    }
                    case 2 -> {
                        log.setSourceId(3L);
                        log.setSourceName("Perimeter Firewall Cluster");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("10.0.0.5");
                        log.setUsername("anonymous");
                        log.setEventType("FIREWALL");
                        log.setAction("CONNECTION_BLOCKED");
                        log.setSeverity(Severity.MEDIUM);
                        log.setMessage("Inbound SYN flood probe dropped by perimeter rule #402");
                        log.setProtocol("TCP");
                        log.setPort(8080);
                        log.setStatus("BLOCKED");
                    }
                    case 3 -> {
                        log.setSourceId(2L);
                        log.setSourceName("Production Web Server 01");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("192.168.1.20");
                        log.setUsername("guest");
                        log.setEventType("APPLICATION");
                        log.setAction("ACCESS_DENIED");
                        log.setSeverity(Severity.LOW);
                        log.setMessage("HTTP 403 Forbidden: Attempted access to restricted /admin/metrics endpoint");
                        log.setProtocol("HTTPS");
                        log.setPort(443);
                        log.setStatus("DENIED");
                    }
                    case 4 -> {
                        log.setSourceId(4L);
                        log.setSourceName("Core Transaction Database");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("10.0.2.50");
                        log.setUsername("dbadmin");
                        log.setEventType("DATABASE");
                        log.setAction("SQL_QUERY");
                        log.setSeverity(Severity.LOW);
                        log.setMessage("Privileged query executed on sensitive customer schema table");
                        log.setProtocol("TCP");
                        log.setPort(3306);
                        log.setStatus("EXECUTED");
                    }
                    case 5 -> {
                        log.setSourceId(5L);
                        log.setSourceName("Branch VPN Gateway");
                        log.setSourceIp(ips[i % ips.length]);
                        log.setDestinationIp("172.16.0.1");
                        log.setUsername("analyst");
                        log.setEventType("NETWORK");
                        log.setAction("VPN_CONNECT");
                        log.setSeverity(Severity.LOW);
                        log.setMessage("TLS tunnel established from authorized client certificate");
                        log.setProtocol("TLS");
                        log.setPort(443);
                        log.setStatus("CONNECTED");
                    }
                    case 6 -> {
                        log.setSourceId(3L);
                        log.setSourceName("Perimeter Firewall Cluster");
                        log.setSourceIp("203.0.113.19");
                        log.setDestinationIp("10.0.0.15");
                        log.setUsername("anonymous");
                        log.setEventType("PORT_ACCESS");
                        log.setAction("SUSPICIOUS_PORT_ACCESS");
                        log.setSeverity(Severity.HIGH);
                        log.setMessage("Port sweep probe detected targeting port 3389 (RDP)");
                        log.setProtocol("TCP");
                        log.setPort(3389);
                        log.setStatus("ALERT");
                    }
                    default -> {
                        log.setSourceId(2L);
                        log.setSourceName("Production Web Server 01");
                        log.setSourceIp("198.51.100.4");
                        log.setDestinationIp("192.168.1.20");
                        log.setUsername("anonymous");
                        log.setEventType("SECURITY_ALERT");
                        log.setAction("SQL_INJECTION_DETECTED");
                        log.setSeverity(Severity.CRITICAL);
                        log.setMessage("WAF Filter Block: Malicious SQL injection payload detected in HTTP URI query parameter");
                        log.setProtocol("HTTPS");
                        log.setPort(443);
                        log.setStatus("BLOCKED");
                    }
                }

                // Add synthetic rawLog & normalizedData JSON
                try {
                    Map<String, Object> rawMap = new HashMap<>();
                    rawMap.put("source", log.getSourceName());
                    rawMap.put("ip", log.getSourceIp());
                    rawMap.put("action", log.getAction());
                    rawMap.put("msg", log.getMessage());
                    log.setRawLog(objectMapper.writeValueAsString(rawMap));
                    log.setNormalizedData(log.getRawLog());
                } catch (Exception ignored) {
                    log.setRawLog("{}");
                    log.setNormalizedData("{}");
                }

                logs.add(log);
            }

            logRepository.saveAll(logs);
        }
    }

    private void seedAlerts() {
        if (alertRepository.count() == 0) {
            logger.info("Seeding initial security alerts...");

            List<Alert> alerts = Arrays.asList(
                    new Alert(1L, "Brute Force Login Detection", 12L, "Possible Brute Force Attack",
                            "Detected 8 failed login attempts from IP 192.168.1.105 within 5 minutes",
                            Severity.HIGH, "192.168.1.105"),

                    new Alert(3L, "Suspicious Port Access Detection", 24L, "Suspicious Port Access Detected",
                            "Traffic detected to high-risk port 3389 (RDP) from external source IP 203.0.113.19",
                            Severity.HIGH, "203.0.113.19"),

                    new Alert(4L, "Immediate Critical Threat Alert", 36L, "Critical SQL Injection Attempt Blocked",
                            "WAF Filter detected and blocked union-based SQL injection attack on /api/v1/checkout",
                            Severity.CRITICAL, "198.51.100.4"),

                    new Alert(2L, "Targeted Account Credential Stuffing", 40L, "Repeated Login Failures Against 'root'",
                            "Detected 12 failed authentication attempts targeting username 'root' within 3 minutes",
                            Severity.HIGH, "10.0.1.80"),

                    new Alert(5L, "Log Flooding & Volumetric Anomaly", 18L, "Anomalous Traffic Spike on Firewall",
                            "Connection rate from IP 192.168.1.45 exceeded normal baseline by 350%",
                            Severity.MEDIUM, "192.168.1.45"),

                    new Alert(1L, "Brute Force Login Detection", 15L, "Resolved: Multiple Failed Logins",
                            "Verified user had expired credentials. Resolved following password update.",
                            Severity.LOW, "172.16.5.22"),

                    new Alert(3L, "Suspicious Port Access Detection", 28L, "Port 22 SSH Connection Attempt",
                            "Internal vulnerability scanner probe on port 22",
                            Severity.LOW, "10.0.2.14"),

                    new Alert(6L, "Possible Brute Force Attack Followed by Successful Login", 45L,
                            "Possible Brute Force Attack Followed by Successful Login",
                            "CRITICAL CORRELATION: 6 failed attempts followed immediately by valid session from IP 192.168.1.105",
                            Severity.CRITICAL, "192.168.1.105"),

                    new Alert(2L, "Targeted Account Credential Stuffing", 50L, "Credential Stuffing Attempt: 'admin'",
                            "Dictionary attack pattern detected targeting administrative portal",
                            Severity.HIGH, "203.0.113.88"),

                    new Alert(5L, "Log Flooding & Volumetric Anomaly", 55L, "Firewall Log Volume Warning",
                            "High burst of UDP traffic recorded on interface eth0",
                            Severity.MEDIUM, "198.51.100.77")
            );

            // Set different statuses
            alerts.get(0).setStatus(AlertStatus.NEW);
            alerts.get(1).setStatus(AlertStatus.NEW);
            alerts.get(2).setStatus(AlertStatus.ACKNOWLEDGED);
            alerts.get(2).setAcknowledgedAt(LocalDateTime.now().minusHours(2));
            alerts.get(2).setAcknowledgedBy("analyst@cloudsentinel.com");

            alerts.get(3).setStatus(AlertStatus.NEW);
            alerts.get(4).setStatus(AlertStatus.ACKNOWLEDGED);
            alerts.get(5).setStatus(AlertStatus.RESOLVED);
            alerts.get(5).setResolvedAt(LocalDateTime.now().minusDays(1));
            alerts.get(6).setStatus(AlertStatus.FALSE_POSITIVE);
            alerts.get(7).setStatus(AlertStatus.NEW);
            alerts.get(8).setStatus(AlertStatus.ACKNOWLEDGED);
            alerts.get(9).setStatus(AlertStatus.RESOLVED);

            alertRepository.saveAll(alerts);
        }
    }

    private void seedIncidents() {
        if (incidentRepository.count() == 0) {
            logger.info("Seeding initial security incidents...");

            Incident inc1 = new Incident(1L, "Unauthorized Brute Force Campaign against Admin Gateway",
                    "Multiple distributed failed attempts observed originating from 192.168.1.105. IP isolated on firewall.",
                    Severity.HIGH, "analyst@cloudsentinel.com");
            inc1.setStatus(IncidentStatus.INVESTIGATING);
            Incident saved1 = incidentRepository.save(inc1);

            incidentNoteRepository.save(new IncidentNote(saved1.getId(), null, "analyst@cloudsentinel.com",
                    "Investigated source IP 192.168.1.105. Multiple failed login attempts originated from this host within 5 minutes. Temporary rate-limit applied."));

            Incident inc2 = new Incident(3L, "SQL Injection Attempt on Production Web Services",
                    "Malicious SQL query injection detected and rejected by perimeter WAF rule.",
                    Severity.CRITICAL, "admin@cloudsentinel.com");
            inc2.setStatus(IncidentStatus.OPEN);
            Incident saved2 = incidentRepository.save(inc2);

            incidentNoteRepository.save(new IncidentNote(saved2.getId(), null, "admin@cloudsentinel.com",
                    "Correlated attack vectors. No data exfiltration detected in MySQL access logs."));

            Incident inc3 = new Incident(2L, "External Port Reconnaissance on RDP 3389",
                    "External IP 203.0.113.19 scanned perimeter ports. Target was dropped at edge.",
                    Severity.MEDIUM, "analyst@cloudsentinel.com");
            inc3.setStatus(IncidentStatus.RESOLVED);
            inc3.setResolvedAt(LocalDateTime.now().minusHours(4));
            Incident saved3 = incidentRepository.save(inc3);

            incidentNoteRepository.save(new IncidentNote(saved3.getId(), null, "analyst@cloudsentinel.com",
                    "Attacking IP added to blackhole routing table. Incident closed successfully."));

            Incident inc4 = new Incident(8L, "Compromise Alarm: Brute Force followed by Successful Session",
                    "High priority correlation rule matched for account 'root'. Account temporarily locked for security verification.",
                    Severity.CRITICAL, "admin@cloudsentinel.com");
            inc4.setStatus(IncidentStatus.OPEN);
            incidentRepository.save(inc4);

            Incident inc5 = new Incident(4L, "Internal Host Port Scanning False Alarm",
                    "Scheduled Nessus security scanner triggered port probe alerts.",
                    Severity.LOW, "analyst@cloudsentinel.com");
            inc5.setStatus(IncidentStatus.CLOSED);
            inc5.setResolvedAt(LocalDateTime.now().minusDays(2));
            incidentRepository.save(inc5);
        }
    }
}
