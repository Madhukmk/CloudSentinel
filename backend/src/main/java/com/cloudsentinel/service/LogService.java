package com.cloudsentinel.service;

import com.cloudsentinel.detection.DetectionEngineService;
import com.cloudsentinel.dto.LogFilterRequest;
import com.cloudsentinel.dto.LogIngestRequest;
import com.cloudsentinel.entity.LogSource;
import com.cloudsentinel.entity.SecurityLog;
import com.cloudsentinel.entity.Severity;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.normalization.LogNormalizationService;
import com.cloudsentinel.repository.LogSourceRepository;
import com.cloudsentinel.repository.SecurityLogRepository;
import com.cloudsentinel.websocket.WebSocketAlertBroadcaster;
import jakarta.persistence.criteria.Predicate;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.data.jpa.domain.Specification;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.util.StringUtils;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.List;

@Service
public class LogService {

    private static final Logger logger = LoggerFactory.getLogger(LogService.class);

    @Autowired
    private SecurityLogRepository logRepository;

    @Autowired
    private LogSourceRepository sourceRepository;

    @Autowired
    private LogNormalizationService normalizationService;

    @Autowired
    private DetectionEngineService detectionEngineService;

    @Autowired
    private WebSocketAlertBroadcaster alertBroadcaster;

    @Transactional
    public SecurityLog ingestLog(LogIngestRequest request) {
        String sourceName = request.getSourceName();

        // If sourceId is provided, look up and refresh the source's lastSeenAt
        if (request.getSourceId() != null) {
            sourceRepository.findById(request.getSourceId()).ifPresent(source -> {
                source.setLastSeenAt(LocalDateTime.now());
                sourceRepository.save(source);
            });
        }

        // Normalize log telemetry
        SecurityLog log = normalizationService.normalize(request, sourceName);

        // Persist normalized log in MySQL
        SecurityLog savedLog = logRepository.save(log);

        // Broadcast new log to live stream
        alertBroadcaster.broadcastLog(savedLog);

        // Feed to Detection Engine
        detectionEngineService.analyze(savedLog);

        return savedLog;
    }

    @Transactional(readOnly = true)
    public Page<SecurityLog> getLogs(LogFilterRequest filter) {
        int page = Math.max(filter.getPage(), 0);
        int size = filter.getSize() > 0 ? filter.getSize() : 20;
        Pageable pageable = PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "timestamp"));

        Specification<SecurityLog> spec = (root, query, cb) -> {
            List<Predicate> predicates = new ArrayList<>();

            if (StringUtils.hasText(filter.getKeyword())) {
                String kw = "%" + filter.getKeyword().trim().toLowerCase() + "%";
                Predicate msg = cb.like(cb.lower(root.get("message")), kw);
                Predicate user = cb.like(cb.lower(root.get("username")), kw);
                Predicate ip = cb.like(cb.lower(root.get("sourceIp")), kw);
                Predicate action = cb.like(cb.lower(root.get("action")), kw);
                predicates.add(cb.or(msg, user, ip, action));
            }

            if (StringUtils.hasText(filter.getSeverity()) && !"ALL".equalsIgnoreCase(filter.getSeverity())) {
                try {
                    Severity severity = Severity.valueOf(filter.getSeverity().toUpperCase());
                    predicates.add(cb.equal(root.get("severity"), severity));
                } catch (Exception ignored) {}
            }

            if (filter.getSourceId() != null) {
                predicates.add(cb.equal(root.get("sourceId"), filter.getSourceId()));
            }

            if (StringUtils.hasText(filter.getEventType()) && !"ALL".equalsIgnoreCase(filter.getEventType())) {
                predicates.add(cb.equal(root.get("eventType"), filter.getEventType().toUpperCase()));
            }

            if (StringUtils.hasText(filter.getAction()) && !"ALL".equalsIgnoreCase(filter.getAction())) {
                predicates.add(cb.equal(root.get("action"), filter.getAction().toUpperCase()));
            }

            if (StringUtils.hasText(filter.getSourceIp())) {
                predicates.add(cb.equal(root.get("sourceIp"), filter.getSourceIp().trim()));
            }

            if (StringUtils.hasText(filter.getStartDate())) {
                try {
                    LocalDateTime start = LocalDateTime.parse(filter.getStartDate(), DateTimeFormatter.ISO_DATE_TIME);
                    predicates.add(cb.greaterThanOrEqualTo(root.get("timestamp"), start));
                } catch (Exception ignored) {}
            }

            if (StringUtils.hasText(filter.getEndDate())) {
                try {
                    LocalDateTime end = LocalDateTime.parse(filter.getEndDate(), DateTimeFormatter.ISO_DATE_TIME);
                    predicates.add(cb.lessThanOrEqualTo(root.get("timestamp"), end));
                } catch (Exception ignored) {}
            }

            return cb.and(predicates.toArray(new Predicate[0]));
        };

        return logRepository.findAll(spec, pageable);
    }

    @Transactional(readOnly = true)
    public SecurityLog getLogById(Long id) {
        return logRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Security log not found with id: " + id));
    }
}
