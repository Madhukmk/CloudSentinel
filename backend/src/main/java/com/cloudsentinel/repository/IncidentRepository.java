package com.cloudsentinel.repository;

import com.cloudsentinel.entity.Incident;
import com.cloudsentinel.entity.IncidentStatus;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentRepository extends JpaRepository<Incident, Long> {
    long countByStatus(IncidentStatus status);
    long countByStatusIn(List<IncidentStatus> statuses);

    Page<Incident> findByStatus(IncidentStatus status, Pageable pageable);
    Page<Incident> findAllByOrderByCreatedAtDesc(Pageable pageable);
    List<Incident> findTop10ByOrderByCreatedAtDesc();

    List<Incident> findTop5ByTitleContainingIgnoreCaseOrAssignedToContainingIgnoreCase(String title, String assignedTo);
    long countByTitleContainingIgnoreCaseOrAssignedToContainingIgnoreCase(String title, String assignedTo);
}
