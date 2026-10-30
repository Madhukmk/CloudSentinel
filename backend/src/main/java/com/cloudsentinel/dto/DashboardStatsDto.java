package com.cloudsentinel.dto;

public class DashboardStatsDto {
    private long totalLogs;
    private long eventsToday;
    private long activeAlerts;
    private long criticalAlerts;
    private long highAlerts;
    private long totalAlerts;
    private double detectionRate;
    private long openIncidents;
    private long activeSources;

    public DashboardStatsDto() {}

    public DashboardStatsDto(long totalLogs, long eventsToday, long activeAlerts,
                             long criticalAlerts, long highAlerts, long totalAlerts,
                             double detectionRate, long openIncidents, long activeSources) {
        this.totalLogs = totalLogs;
        this.eventsToday = eventsToday;
        this.activeAlerts = activeAlerts;
        this.criticalAlerts = criticalAlerts;
        this.highAlerts = highAlerts;
        this.totalAlerts = totalAlerts;
        this.detectionRate = detectionRate;
        this.openIncidents = openIncidents;
        this.activeSources = activeSources;
    }

    public DashboardStatsDto(long totalLogs, long eventsToday, long activeAlerts,
                             long criticalAlerts, long openIncidents, long activeSources) {
        this(totalLogs, eventsToday, activeAlerts, criticalAlerts, 0, activeAlerts, 0.0, openIncidents, activeSources);
    }

    public long getTotalLogs() {
        return totalLogs;
    }

    public void setTotalLogs(long totalLogs) {
        this.totalLogs = totalLogs;
    }

    public long getEventsToday() {
        return eventsToday;
    }

    public void setEventsToday(long eventsToday) {
        this.eventsToday = eventsToday;
    }

    public long getActiveAlerts() {
        return activeAlerts;
    }

    public void setActiveAlerts(long activeAlerts) {
        this.activeAlerts = activeAlerts;
    }

    public long getCriticalAlerts() {
        return criticalAlerts;
    }

    public void setCriticalAlerts(long criticalAlerts) {
        this.criticalAlerts = criticalAlerts;
    }

    public long getHighAlerts() {
        return highAlerts;
    }

    public void setHighAlerts(long highAlerts) {
        this.highAlerts = highAlerts;
    }

    public long getTotalAlerts() {
        return totalAlerts;
    }

    public void setTotalAlerts(long totalAlerts) {
        this.totalAlerts = totalAlerts;
    }

    public double getDetectionRate() {
        return detectionRate;
    }

    public void setDetectionRate(double detectionRate) {
        this.detectionRate = detectionRate;
    }

    public long getOpenIncidents() {
        return openIncidents;
    }

    public void setOpenIncidents(long openIncidents) {
        this.openIncidents = openIncidents;
    }

    public long getActiveSources() {
        return activeSources;
    }

    public void setActiveSources(long activeSources) {
        this.activeSources = activeSources;
    }
}
