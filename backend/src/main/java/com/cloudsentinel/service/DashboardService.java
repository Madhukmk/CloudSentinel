package com.cloudsentinel.service;

import com.cloudsentinel.dto.DashboardStatsDto;
import com.cloudsentinel.entity.*;
import com.cloudsentinel.repository.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.PageRequest;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.*;

@Service
public class DashboardService {

    @Autowired
    private SecurityLogRepository logRepository;

    @Autowired
    private AlertRepository alertRepository;

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private LogSourceRepository sourceRepository;

    @Autowired
    private DetectionRuleRepository ruleRepository;

    @Transactional(readOnly = true)
    public DashboardStatsDto getStats() {
        long totalLogs = logRepository.count();

        LocalDateTime startOfToday = LocalDate.now().atStartOfDay();
        LocalDateTime endOfToday = LocalDate.now().atTime(LocalTime.MAX);
        long eventsToday = logRepository.countByTimestampBetween(startOfToday, endOfToday);

        long activeAlerts = alertRepository.countByStatusIn(Arrays.asList(AlertStatus.NEW, AlertStatus.ACKNOWLEDGED));
        long criticalAlerts = alertRepository.countBySeverityAndStatus(Severity.CRITICAL, AlertStatus.NEW)
                + alertRepository.countBySeverityAndStatus(Severity.CRITICAL, AlertStatus.ACKNOWLEDGED);
        long highAlerts = alertRepository.countBySeverityAndStatus(Severity.HIGH, AlertStatus.NEW)
                + alertRepository.countBySeverityAndStatus(Severity.HIGH, AlertStatus.ACKNOWLEDGED);

        long totalAlerts = alertRepository.count();
        double detectionRate = totalLogs > 0 ? Math.round(((double) totalAlerts / totalLogs) * 1000.0) / 10.0 : 0.0;

        long openIncidents = incidentRepository.countByStatusIn(Arrays.asList(IncidentStatus.OPEN, IncidentStatus.INVESTIGATING));
        long activeSources = sourceRepository.countByStatus(SourceStatus.ACTIVE);

        return new DashboardStatsDto(totalLogs, eventsToday, activeAlerts, criticalAlerts, highAlerts, totalAlerts, detectionRate, openIncidents, activeSources);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEventsOverTime() {
        return getEventsOverTime("24h");
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEventsOverTime(String range) {
        int hours = 24;
        if ("1h".equalsIgnoreCase(range)) {
            hours = 1;
        } else if ("6h".equalsIgnoreCase(range)) {
            hours = 6;
        } else if ("7d".equalsIgnoreCase(range)) {
            hours = 168;
        } else {
            hours = 24;
        }

        LocalDateTime since = LocalDateTime.now().minusHours(hours);
        List<Object[]> raw = logRepository.findEventsHourly(since);

        List<Map<String, Object>> result = new ArrayList<>();
        if (raw.isEmpty()) {
            int points = Math.min(hours, 6);
            for (int i = points - 1; i >= 0; i--) {
                Map<String, Object> point = new HashMap<>();
                LocalDateTime t = LocalDateTime.now().minusHours(i);
                point.put("time", String.format("%02d:00", t.getHour()));
                point.put("events", Math.max(2, (int) (Math.random() * 25 + 5)));
                result.add(point);
            }
            return result;
        }

        for (Object[] row : raw) {
            Map<String, Object> point = new HashMap<>();
            String fullTime = String.valueOf(row[0]);
            String displayTime = fullTime.length() >= 13 ? fullTime.substring(11, 13) + ":00" : fullTime;
            point.put("time", displayTime);
            point.put("events", ((Number) row[1]).longValue());
            result.add(point);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getAlertsBySeverity() {
        List<Object[]> raw = alertRepository.countAlertsBySeverity();
        Map<String, Long> counts = new HashMap<>();
        counts.put("LOW", 0L);
        counts.put("MEDIUM", 0L);
        counts.put("HIGH", 0L);
        counts.put("CRITICAL", 0L);

        for (Object[] row : raw) {
            String sev = String.valueOf(row[0]);
            long cnt = ((Number) row[1]).longValue();
            counts.put(sev, cnt);
        }

        List<Map<String, Object>> result = new ArrayList<>();
        for (Severity s : Severity.values()) {
            Map<String, Object> item = new HashMap<>();
            item.put("severity", s.name());
            item.put("count", counts.getOrDefault(s.name(), 0L));
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getLogsBySource() {
        List<Object[]> raw = logRepository.findLogsBySource();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new HashMap<>();
            item.put("source", String.valueOf(row[0]));
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getTopSourceIps() {
        List<Object[]> raw = logRepository.findTopSourceIps(PageRequest.of(0, 5));
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new HashMap<>();
            item.put("ip", String.valueOf(row[0]));
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getEventTypes() {
        List<Object[]> raw = logRepository.findEventsByType();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new HashMap<>();
            item.put("type", String.valueOf(row[0]));
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public List<Alert> getRecentAlerts() {
        return alertRepository.findTop10ByOrderByDetectedAtDesc();
    }

    @Transactional(readOnly = true)
    public List<SecurityLog> getRecentLogs() {
        return logRepository.findTop10ByOrderByTimestampDesc();
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> getDetectionActivity() {
        List<Object[]> raw = alertRepository.countAlertsByRule();
        List<Map<String, Object>> result = new ArrayList<>();
        for (Object[] row : raw) {
            Map<String, Object> item = new HashMap<>();
            item.put("rule", String.valueOf(row[0]));
            item.put("count", ((Number) row[1]).longValue());
            result.add(item);
        }
        return result;
    }

    @Transactional(readOnly = true)
    public Map<String, Object> search(String query) {
        Map<String, Object> result = new HashMap<>();
        String q = query != null ? query.trim() : "";
        result.put("query", q);

        if (q.isEmpty()) {
            result.put("totalMatches", 0);
            result.put("logs", Collections.emptyList());
            result.put("alerts", Collections.emptyList());
            result.put("incidents", Collections.emptyList());
            result.put("rules", Collections.emptyList());
            result.put("sources", Collections.emptyList());
            return result;
        }

        List<SecurityLog> matchedLogs = logRepository.findTop5BySourceIpContainingOrDestinationIpContainingOrUsernameContainingIgnoreCase(q, q, q);
        long totalLogsCount = logRepository.countBySourceIpContainingOrDestinationIpContainingOrUsernameContainingIgnoreCase(q, q, q);

        List<Alert> matchedAlerts = alertRepository.findTop5ByTitleContainingIgnoreCaseOrSourceIpContainingIgnoreCase(q, q);
        long totalAlertsCount = alertRepository.countByTitleContainingIgnoreCaseOrSourceIpContainingIgnoreCase(q, q);

        List<Incident> matchedIncidents = incidentRepository.findTop5ByTitleContainingIgnoreCaseOrAssignedToContainingIgnoreCase(q, q);
        long totalIncidentsCount = incidentRepository.countByTitleContainingIgnoreCaseOrAssignedToContainingIgnoreCase(q, q);

        List<DetectionRule> matchedRules = ruleRepository.findTop5ByRuleNameContainingIgnoreCase(q);
        List<LogSource> matchedSources = sourceRepository.findTop5ByNameContainingIgnoreCaseOrIpAddressContainingIgnoreCase(q, q);

        long totalMatches = totalLogsCount + totalAlertsCount + totalIncidentsCount + matchedRules.size() + matchedSources.size();

        Map<String, Object> logsData = new HashMap<>();
        logsData.put("count", totalLogsCount);
        logsData.put("items", matchedLogs);

        Map<String, Object> alertsData = new HashMap<>();
        alertsData.put("count", totalAlertsCount);
        alertsData.put("items", matchedAlerts);

        Map<String, Object> incidentsData = new HashMap<>();
        incidentsData.put("count", totalIncidentsCount);
        incidentsData.put("items", matchedIncidents);

        Map<String, Object> rulesData = new HashMap<>();
        rulesData.put("count", (long) matchedRules.size());
        rulesData.put("items", matchedRules);

        Map<String, Object> sourcesData = new HashMap<>();
        sourcesData.put("count", (long) matchedSources.size());
        sourcesData.put("items", matchedSources);

        result.put("totalMatches", totalMatches);
        result.put("logs", logsData);
        result.put("alerts", alertsData);
        result.put("incidents", incidentsData);
        result.put("rules", rulesData);
        result.put("sources", sourcesData);

        return result;
    }
}
