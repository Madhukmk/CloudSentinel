package com.cloudsentinel.repository;

import com.cloudsentinel.entity.IncidentNote;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface IncidentNoteRepository extends JpaRepository<IncidentNote, Long> {
    List<IncidentNote> findByIncidentIdOrderByCreatedAtAsc(Long incidentId);
}
