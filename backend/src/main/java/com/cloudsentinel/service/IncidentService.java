package com.cloudsentinel.service;

import com.cloudsentinel.dto.IncidentCreateRequest;
import com.cloudsentinel.dto.IncidentNoteRequest;
import com.cloudsentinel.dto.IncidentStatusUpdateRequest;
import com.cloudsentinel.entity.Incident;
import com.cloudsentinel.entity.IncidentNote;
import com.cloudsentinel.entity.IncidentStatus;
import com.cloudsentinel.exception.ResourceNotFoundException;
import com.cloudsentinel.repository.IncidentNoteRepository;
import com.cloudsentinel.repository.IncidentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class IncidentService {

    @Autowired
    private IncidentRepository incidentRepository;

    @Autowired
    private IncidentNoteRepository incidentNoteRepository;

    @Autowired
    private AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public Page<Incident> getIncidents(IncidentStatus status, Pageable pageable) {
        if (status != null) {
            return incidentRepository.findByStatus(status, pageable);
        }
        return incidentRepository.findAllByOrderByCreatedAtDesc(pageable);
    }

    @Transactional(readOnly = true)
    public Incident getIncidentById(Long id) {
        return incidentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Incident not found with id: " + id));
    }

    @Transactional
    public Incident createIncident(IncidentCreateRequest request, String creator) {
        Incident incident = new Incident();
        incident.setAlertId(request.getAlertId());
        incident.setTitle(request.getTitle());
        incident.setDescription(request.getDescription());
        incident.setSeverity(request.getSeverity());
        incident.setStatus(request.getStatus() != null ? request.getStatus() : IncidentStatus.OPEN);
        incident.setAssignedTo(request.getAssignedTo() != null ? request.getAssignedTo() : creator);

        Incident saved = incidentRepository.save(incident);

        // Add initial system note
        IncidentNote initialNote = new IncidentNote(saved.getId(), null, creator,
                "Incident opened and logged in SOC Incident Management system.");
        incidentNoteRepository.save(initialNote);

        auditLogService.logAction(null, creator, "CREATE_INCIDENT",
                String.format("Incident #%d created: %s", saved.getId(), saved.getTitle()), null);

        return saved;
    }

    @Transactional
    public Incident updateStatus(Long id, IncidentStatusUpdateRequest request, String username) {
        Incident incident = getIncidentById(id);

        if (request.getStatus() != null) {
            incident.setStatus(request.getStatus());
            if (request.getStatus() == IncidentStatus.RESOLVED || request.getStatus() == IncidentStatus.CLOSED) {
                incident.setResolvedAt(LocalDateTime.now());
            }
        }

        if (request.getAssignedTo() != null) {
            incident.setAssignedTo(request.getAssignedTo());
        }

        Incident updated = incidentRepository.save(incident);
        auditLogService.logAction(null, username, "UPDATE_INCIDENT",
                String.format("Incident #%d updated to status %s (Assigned: %s)",
                        id, updated.getStatus(), updated.getAssignedTo()), null);
        return updated;
    }

    @Transactional
    public IncidentNote addNote(Long incidentId, IncidentNoteRequest request, String author) {
        // Ensure incident exists
        getIncidentById(incidentId);

        IncidentNote note = new IncidentNote(incidentId, null, author, request.getNote().trim());
        IncidentNote saved = incidentNoteRepository.save(note);

        auditLogService.logAction(null, author, "ADD_INCIDENT_NOTE",
                String.format("Added investigation note to Incident #%d", incidentId), null);
        return saved;
    }

    @Transactional(readOnly = true)
    public List<IncidentNote> getNotes(Long incidentId) {
        return incidentNoteRepository.findByIncidentIdOrderByCreatedAtAsc(incidentId);
    }

    @Transactional
    public IncidentNote updateNote(Long incidentId, Long noteId, IncidentNoteRequest request, String username) {
        IncidentNote note = incidentNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident note not found with id: " + noteId));
        note.setNote(request.getNote().trim());
        IncidentNote saved = incidentNoteRepository.save(note);
        auditLogService.logAction(null, username, "UPDATE_INCIDENT_NOTE",
                String.format("Updated note #%d for Incident #%d", noteId, incidentId), null);
        return saved;
    }

    @Transactional
    public void deleteNote(Long incidentId, Long noteId, String username) {
        IncidentNote note = incidentNoteRepository.findById(noteId)
                .orElseThrow(() -> new ResourceNotFoundException("Incident note not found with id: " + noteId));
        incidentNoteRepository.delete(note);
        auditLogService.logAction(null, username, "DELETE_INCIDENT_NOTE",
                String.format("Deleted note #%d from Incident #%d", noteId, incidentId), null);
    }
}
