package com.cloudsentinel.repository;

import com.cloudsentinel.entity.SecurityLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.JpaSpecificationExecutor;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;

@Repository
public interface SecurityLogRepository extends JpaRepository<SecurityLog, Long>, JpaSpecificationExecutor<SecurityLog> {

    long countByTimestampBetween(LocalDateTime start, LocalDateTime end);

    long countBySourceIpAndActionAndTimestampAfter(String sourceIp, String action, LocalDateTime after);

    long countByUsernameAndActionAndTimestampAfter(String username, String action, LocalDateTime after);

    long countBySourceIpAndEventTypeAndTimestampAfter(String sourceIp, String eventType, LocalDateTime after);

    List<SecurityLog> findBySourceIpAndTimestampAfterOrderByTimestampAsc(String sourceIp, LocalDateTime after);

    List<SecurityLog> findTop10ByOrderByTimestampDesc();

    @Query("SELECT l.sourceIp, COUNT(l) FROM SecurityLog l GROUP BY l.sourceIp ORDER BY COUNT(l) DESC")
    List<Object[]> findTopSourceIps(Pageable pageable);

    @Query("SELECT COALESCE(l.sourceName, 'Unknown'), COUNT(l) FROM SecurityLog l GROUP BY l.sourceName")
    List<Object[]> findLogsBySource();

    @Query("SELECT l.eventType, COUNT(l) FROM SecurityLog l GROUP BY l.eventType")
    List<Object[]> findEventsByType();

    @Query("SELECT l.severity, COUNT(l) FROM SecurityLog l GROUP BY l.severity")
    List<Object[]> findEventsBySeverity();

    @Query(value = "SELECT DATE_FORMAT(timestamp, '%Y-%m-%d %H:00') as hr, COUNT(*) as cnt FROM security_logs WHERE timestamp >= :since GROUP BY hr ORDER BY hr ASC", nativeQuery = true)
    List<Object[]> findEventsHourly(@Param("since") LocalDateTime since);

    List<SecurityLog> findTop5BySourceIpContainingOrDestinationIpContainingOrUsernameContainingIgnoreCase(String sourceIp, String destinationIp, String username);

    long countBySourceIpContainingOrDestinationIpContainingOrUsernameContainingIgnoreCase(String sourceIp, String destinationIp, String username);
}
