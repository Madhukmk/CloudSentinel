package com.cloudsentinel.repository;

import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.AlertStatus;
import com.cloudsentinel.entity.Severity;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface AlertRepository extends JpaRepository<Alert, Long> {
    long countByStatus(AlertStatus status);
    long countBySeverity(Severity severity);
    long countBySeverityAndStatus(Severity severity, AlertStatus status);
    long countByStatusIn(List<AlertStatus> statuses);

    boolean existsBySourceIpAndRuleIdAndDetectedAtAfter(String sourceIp, Long ruleId, LocalDateTime after);

    Page<Alert> findByStatus(AlertStatus status, Pageable pageable);
    Page<Alert> findBySeverity(Severity severity, Pageable pageable);
    Page<Alert> findByStatusAndSeverity(AlertStatus status, Severity severity, Pageable pageable);
    Page<Alert> findAllByOrderByDetectedAtDesc(Pageable pageable);

    List<Alert> findTop10ByOrderByDetectedAtDesc();

    Page<Alert> findBySourceIp(String sourceIp, Pageable pageable);
    List<Alert> findTop5ByTitleContainingIgnoreCaseOrSourceIpContainingIgnoreCase(String title, String sourceIp);
    long countByTitleContainingIgnoreCaseOrSourceIpContainingIgnoreCase(String title, String sourceIp);

    @Query("SELECT a.severity, COUNT(a) FROM Alert a GROUP BY a.severity")
    List<Object[]> countAlertsBySeverity();

    @Query("SELECT COALESCE(a.ruleName, 'Custom Detection'), COUNT(a) FROM Alert a GROUP BY a.ruleName ORDER BY COUNT(a) DESC")
    List<Object[]> countAlertsByRule();
}
