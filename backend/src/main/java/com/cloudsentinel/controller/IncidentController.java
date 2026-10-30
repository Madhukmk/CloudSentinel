package com.cloudsentinel.controller;

import com.cloudsentinel.dto.ApiResponse;
import com.cloudsentinel.dto.IncidentCreateRequest;
import com.cloudsentinel.dto.IncidentNoteRequest;
import com.cloudsentinel.dto.IncidentStatusUpdateRequest;
import com.cloudsentinel.entity.Incident;
import com.cloudsentinel.entity.IncidentNote;
import com.cloudsentinel.entity.IncidentStatus;
import com.cloudsentinel.service.IncidentService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Sort;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/incidents")
@Tag(name = "Incidents Management", description = "Endpoints for security incident investigation and workflow")
public class IncidentController {

    @Autowired
    private IncidentService incidentService;

    @GetMapping
    @Operation(summary = "Get list of incidents with status filtering and pagination")
    public ResponseEntity<ApiResponse<Page<Incident>>> getIncidents(
            @RequestParam(required = false) IncidentStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "20") int size
    ) {
        Page<Incident> incidents = incidentService.getIncidents(status, PageRequest.of(page, size, Sort.by(Sort.Direction.DESC, "createdAt")));
        return ResponseEntity.ok(ApiResponse.ok(incidents));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get single incident details")
    public ResponseEntity<ApiResponse<Incident>> getIncidentById(@PathVariable Long id) {
        Incident incident = incidentService.getIncidentById(id);
        return ResponseEntity.ok(ApiResponse.ok(incident));
    }

    @PostMapping
    @Operation(summary = "Create an incident from an alert or manual security event")
    public ResponseEntity<ApiResponse<Incident>> createIncident(
            @Valid @RequestBody IncidentCreateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String creator = userDetails != null ? userDetails.getUsername() : "analyst";
        Incident incident = incidentService.createIncident(request, creator);
        return ResponseEntity.ok(ApiResponse.ok("Incident created successfully", incident));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update incident status or assignee")
    public ResponseEntity<ApiResponse<Incident>> updateIncident(
            @PathVariable Long id,
            @RequestBody IncidentStatusUpdateRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        Incident incident = incidentService.updateStatus(id, request, username);
        return ResponseEntity.ok(ApiResponse.ok("Incident updated successfully", incident));
    }

    @PostMapping("/{id}/notes")
    @Operation(summary = "Add an investigation note to an incident")
    public ResponseEntity<ApiResponse<IncidentNote>> addNote(
            @PathVariable Long id,
            @Valid @RequestBody IncidentNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String author = userDetails != null ? userDetails.getUsername() : "analyst";
        IncidentNote note = incidentService.addNote(id, request, author);
        return ResponseEntity.ok(ApiResponse.ok("Investigation note added", note));
    }

    @GetMapping("/{id}/notes")
    @Operation(summary = "Get investigation timeline notes for an incident")
    public ResponseEntity<ApiResponse<List<IncidentNote>>> getNotes(@PathVariable Long id) {
        List<IncidentNote> notes = incidentService.getNotes(id);
        return ResponseEntity.ok(ApiResponse.ok(notes));
    }

    @PutMapping("/{id}/notes/{noteId}")
    @Operation(summary = "Update an existing investigation note")
    public ResponseEntity<ApiResponse<IncidentNote>> updateNote(
            @PathVariable Long id,
            @PathVariable Long noteId,
            @Valid @RequestBody IncidentNoteRequest request,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        IncidentNote note = incidentService.updateNote(id, noteId, request, username);
        return ResponseEntity.ok(ApiResponse.ok("Investigation note updated", note));
    }

    @DeleteMapping("/{id}/notes/{noteId}")
    @Operation(summary = "Delete an investigation note")
    public ResponseEntity<ApiResponse<Void>> deleteNote(
            @PathVariable Long id,
            @PathVariable Long noteId,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        String username = userDetails != null ? userDetails.getUsername() : "analyst";
        incidentService.deleteNote(id, noteId, username);
        return ResponseEntity.ok(ApiResponse.ok("Investigation note deleted", null));
    }
}
