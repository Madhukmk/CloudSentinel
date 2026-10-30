package com.cloudsentinel.normalization;

import com.cloudsentinel.dto.LogIngestRequest;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.entity.Severity;
import com.fasterxml.jackson.databind.ObjectMapper;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.HashMap;
import java.util.Map;

@Service
public class LogNormalizationService {

    private static final Logger logger = LoggerFactory.getLogger(LogNormalizationService.class);

    @Autowired
    private ObjectMapper objectMapper;

    public SecurityLog normalize(LogIngestRequest request, String sourceDefaultName) {
        SecurityLog log = new SecurityLog();

        // 1. Source Mapping
        log.setSourceId(request.getSourceId());
        if (StringUtils.hasText(request.getSourceName())) {
            log.setSourceName(request.getSourceName());
        } else {
            log.setSourceName(sourceDefaultName != null ? sourceDefaultName : "Generic Source");
        }

        // 2. IP Address Normalization
        String sourceIp = resolveField(request.getSourceIp(), request.getSrc(), request.getClient_ip(), "127.0.0.1");
        log.setSourceIp(sourceIp.trim());

        String destinationIp = resolveField(request.getDestinationIp(), request.getDst(), null, "10.0.0.1");
        log.setDestinationIp(destinationIp.trim());

        // 3. Username Normalization
        String username = resolveField(request.getUsername(), request.getUser(), null, "anonymous");
        log.setUsername(username.trim());

        // 4. Event Type Normalization
        String eventType = resolveField(request.getEventType(), request.getEvent(), null, "SYSTEM");
        log.setEventType(normalizeEventType(eventType));

        // 5. Action Normalization
        String action = resolveField(request.getAction(), null, null, null);
        log.setAction(normalizeAction(action, request.getMessage(), request.getMsg()));

        // 6. Severity Normalization
        log.setSeverity(normalizeSeverity(request.getSeverity()));

        // 7. Message Normalization
        String message = resolveField(request.getMessage(), request.getMsg(), null, "Security event recorded");
        log.setMessage(message);

        // 8. Protocol and Port
        log.setProtocol(StringUtils.hasText(request.getProtocol()) ? request.getProtocol().toUpperCase() : "TCP");
        log.setPort(request.getPort() != null ? request.getPort() : 80);
        log.setStatus(StringUtils.hasText(request.getStatus()) ? request.getStatus().toUpperCase() : "LOGGED");

        // 9. Timestamp Standardization
        log.setTimestamp(parseTimestamp(request.getTimestamp()));

        // 10. Raw Log and Normalized Data Preservation
        try {
            String rawJson = objectMapper.writeValueAsString(request);
            log.setRawLog(rawJson);

            Map<String, Object> normalizedMap = new HashMap<>();
            normalizedMap.put("sourceIp", log.getSourceIp());
            normalizedMap.put("destinationIp", log.getDestinationIp());
            normalizedMap.put("username", log.getUsername());
            normalizedMap.put("eventType", log.getEventType());
            normalizedMap.put("action", log.getAction());
            normalizedMap.put("severity", log.getSeverity().name());
            normalizedMap.put("protocol", log.getProtocol());
            normalizedMap.put("port", log.getPort());
            normalizedMap.put("timestamp", log.getTimestamp().toString());
            normalizedMap.put("message", log.getMessage());

            log.setNormalizedData(objectMapper.writeValueAsString(normalizedMap));
        } catch (Exception e) {
            logger.warn("Could not serialize raw/normalized payload JSON: {}", e.getMessage());
            log.setRawLog(request.toString());
            log.setNormalizedData("{}");
        }

        return log;
    }

    private String resolveField(String primary, String secondary, String tertiary, String defaultValue) {
        if (StringUtils.hasText(primary)) return primary;
        if (StringUtils.hasText(secondary)) return secondary;
        if (StringUtils.hasText(tertiary)) return tertiary;
        return defaultValue;
    }

    public Severity normalizeSeverity(String input) {
        if (!StringUtils.hasText(input)) return Severity.LOW;
        String s = input.trim().toUpperCase();
        if (s.contains("CRIT") || s.contains("FATAL") || s.contains("EMERGENCY")) {
            return Severity.CRITICAL;
        } else if (s.contains("HIGH") || s.contains("ERR")) {
            return Severity.HIGH;
        } else if (s.contains("MED") || s.contains("WARN")) {
            return Severity.MEDIUM;
        } else {
            return Severity.LOW;
        }
    }

    public String normalizeEventType(String input) {
        if (!StringUtils.hasText(input)) return "SYSTEM";
        String s = input.trim().toUpperCase();
        if (s.contains("LOGIN") || s.contains("AUTH")) return "LOGIN";
        if (s.contains("FIREWALL") || s.contains("FW") || s.contains("IPTABLES")) return "FIREWALL";
        if (s.contains("PORT") || s.contains("SCAN") || s.contains("PROBE")) return "PORT_ACCESS";
        if (s.contains("DB") || s.contains("SQL") || s.contains("DATABASE")) return "DATABASE";
        if (s.contains("NET") || s.contains("PACKET") || s.contains("ROUTER")) return "NETWORK";
        if (s.contains("APP") || s.contains("WEB") || s.contains("HTTP")) return "APPLICATION";
        return s;
    }

    public String normalizeAction(String action, String message, String msg) {
        String combined = (action + " " + message + " " + msg).toUpperCase();
        if (combined.contains("FAIL") || combined.contains("INVALID") || combined.contains("BAD_CRED") || combined.contains("REJECT")) {
            return "LOGIN_FAILED";
        }
        if (combined.contains("SUCCESS") || combined.contains("ACCEPTED") || combined.contains("ALLOWED")) {
            return "LOGIN_SUCCESS";
        }
        if (combined.contains("BLOCK") || combined.contains("DROP") || combined.contains("DENY")) {
            return "CONNECTION_BLOCKED";
        }
        if (combined.contains("PORT") || combined.contains("SYN")) {
            return "SUSPICIOUS_PORT_ACCESS";
        }
        if (StringUtils.hasText(action)) {
            return action.toUpperCase();
        }
        return "EVENT_RECORDED";
    }

    private LocalDateTime parseTimestamp(String timestampStr) {
        if (!StringUtils.hasText(timestampStr)) {
            return LocalDateTime.now();
        }
        try {
            return LocalDateTime.parse(timestampStr, DateTimeFormatter.ISO_DATE_TIME);
        } catch (Exception e1) {
            try {
                return LocalDateTime.parse(timestampStr);
            } catch (Exception e2) {
                return LocalDateTime.now();
            }
        }
    }
}
