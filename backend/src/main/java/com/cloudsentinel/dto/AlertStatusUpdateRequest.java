package com.cloudsentinel.dto;

import com.cloudsentinel.entity.AlertStatus;

public class AlertStatusUpdateRequest {
    private AlertStatus status;

    public AlertStatusUpdateRequest() {}

    public AlertStatusUpdateRequest(AlertStatus status) {
        this.status = status;
    }

    public AlertStatus getStatus() {
        return status;
    }

    public void setStatus(AlertStatus status) {
        this.status = status;
    }
}
