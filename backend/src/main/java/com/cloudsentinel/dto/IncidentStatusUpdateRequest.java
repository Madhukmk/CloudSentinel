package com.cloudsentinel.dto;

import com.cloudsentinel.entity.IncidentStatus;

public class IncidentStatusUpdateRequest {
    private IncidentStatus status;
    private String assignedTo;

    public IncidentStatusUpdateRequest() {}

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
