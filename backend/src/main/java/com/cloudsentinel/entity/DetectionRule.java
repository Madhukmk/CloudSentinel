package com.cloudsentinel.entity;

import jakarta.persistence.*;
import jakarta.validation.constraints.NotBlank;
import java.time.LocalDateTime;

@Entity
@Table(name = "detection_rules")
public class DetectionRule {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @NotBlank
    @Column(nullable = false, unique = true)
    private String ruleName;

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(length = 50)
    private String eventType;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 30)
    private ConditionType conditionType;

    @Column(nullable = false)
    private Integer threshold = 5;

    @Column(nullable = false)
    private Integer timeWindow = 5; // in minutes

    @Column(nullable = false)
    private Integer cooldownMinutes = 5; // deduplication cooldown in minutes

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity = Severity.HIGH;

    @Column(nullable = false)
    private boolean enabled = true;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    public DetectionRule() {
    }

    public DetectionRule(String ruleName, String description, String eventType,
                         ConditionType conditionType, Integer threshold,
                         Integer timeWindow, Severity severity, boolean enabled) {
        this.ruleName = ruleName;
        this.description = description;
        this.eventType = eventType;
        this.conditionType = conditionType;
        this.threshold = threshold;
        this.timeWindow = timeWindow;
        this.cooldownMinutes = timeWindow != null ? Math.max(timeWindow, 3) : 5;
        this.severity = severity;
        this.enabled = enabled;
    }

    public DetectionRule(String ruleName, String description, String eventType,
                         ConditionType conditionType, Integer threshold,
                         Integer timeWindow, Integer cooldownMinutes, Severity severity, boolean enabled) {
        this.ruleName = ruleName;
        this.description = description;
        this.eventType = eventType;
        this.conditionType = conditionType;
        this.threshold = threshold;
        this.timeWindow = timeWindow;
        this.cooldownMinutes = cooldownMinutes != null ? cooldownMinutes : (timeWindow != null ? Math.max(timeWindow, 3) : 5);
        this.severity = severity;
        this.enabled = enabled;
    }

    @PrePersist
    protected void onCreate() {
        this.createdAt = LocalDateTime.now();
        this.updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    protected void onUpdate() {
        this.updatedAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getRuleName() {
        return ruleName;
    }

    public void setRuleName(String ruleName) {
        this.ruleName = ruleName;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public ConditionType getConditionType() {
        return conditionType;
    }

    public void setConditionType(ConditionType conditionType) {
        this.conditionType = conditionType;
    }

    public Integer getThreshold() {
        return threshold;
    }

    public void setThreshold(Integer threshold) {
        this.threshold = threshold;
    }

    public Integer getTimeWindow() {
        return timeWindow;
    }

    public void setTimeWindow(Integer timeWindow) {
        this.timeWindow = timeWindow;
    }

    public Integer getCooldownMinutes() {
        return cooldownMinutes != null ? cooldownMinutes : (timeWindow != null ? Math.max(timeWindow, 3) : 5);
    }

    public void setCooldownMinutes(Integer cooldownMinutes) {
        this.cooldownMinutes = cooldownMinutes;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public boolean isEnabled() {
        return enabled;
    }

    public void setEnabled(boolean enabled) {
        this.enabled = enabled;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
