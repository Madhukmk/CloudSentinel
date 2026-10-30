package com.cloudsentinel.repository;

import com.cloudsentinel.entity.LogSource;
import com.cloudsentinel.entity.SourceStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface LogSourceRepository extends JpaRepository<LogSource, Long> {
    long countByStatus(SourceStatus status);
    List<LogSource> findByStatus(SourceStatus status);
    List<LogSource> findTop5ByNameContainingIgnoreCaseOrIpAddressContainingIgnoreCase(String name, String ipAddress);
}
