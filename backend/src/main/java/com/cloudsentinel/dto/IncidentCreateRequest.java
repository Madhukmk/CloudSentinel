package com.cloudsentinel.dto;

import com.cloudsentinel.entity.IncidentStatus;
import com.cloudsentinel.entity.Severity;
import jakarta.validation.constraints.NotBlank;

public class IncidentCreateRequest {
    private Long alertId;

    @NotBlank(message = "Title is required")
    private String title;

    private String description;
    private Severity severity = Severity.HIGH;
    private IncidentStatus status = IncidentStatus.OPEN;
    private String assignedTo;

    public IncidentCreateRequest() {}

    public Long getAlertId() {
        return alertId;
    }

    public void setAlertId(Long alertId) {
        this.alertId = alertId;
    }

    public String getTitle() {
        return title;
    }

    public void setTitle(String title) {
        this.title = title;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public IncidentStatus getStatus() {
        return status;
    }

    public void setStatus(IncidentStatus status) {
        this.status = status;
    }

    public String getAssignedTo() {
        return assignedTo;
    }

    public void setAssignedTo(String assignedTo) {
        this.assignedTo = assignedTo;
    }
}
