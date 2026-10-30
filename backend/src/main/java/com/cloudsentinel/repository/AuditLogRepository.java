package com.cloudsentinel.repository;

import com.cloudsentinel.entity.AuditLog;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface AuditLogRepository extends JpaRepository<AuditLog, Long> {
    Page<AuditLog> findAllByOrderByTimestampDesc(Pageable pageable);
    Page<AuditLog> findByUsernameContainingIgnoreCaseOrderByTimestampDesc(String username, Pageable pageable);
    Page<AuditLog> findByActionContainingIgnoreCaseOrderByTimestampDesc(String action, Pageable pageable);
    Page<AuditLog> findByUsernameContainingIgnoreCaseAndActionContainingIgnoreCaseOrderByTimestampDesc(String username, String action, Pageable pageable);
}
