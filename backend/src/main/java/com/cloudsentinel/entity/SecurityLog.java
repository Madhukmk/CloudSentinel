package com.cloudsentinel.entity;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "security_logs", indexes = {
    @Index(name = "idx_log_timestamp", columnList = "timestamp"),
    @Index(name = "idx_log_source_ip", columnList = "sourceIp"),
    @Index(name = "idx_log_event_type", columnList = "eventType"),
    @Index(name = "idx_log_severity", columnList = "severity"),
    @Index(name = "idx_log_action", columnList = "action")
})
public class SecurityLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private Long sourceId;

    private String sourceName;

    @Column(nullable = false)
    private LocalDateTime timestamp;

    @Column(nullable = false, length = 64)
    private String sourceIp;

    @Column(length = 64)
    private String destinationIp;

    @Column(length = 100)
    private String username;

    @Column(nullable = false, length = 50)
    private String eventType;

    @Column(length = 50)
    private String action;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private Severity severity = Severity.LOW;

    @Column(columnDefinition = "TEXT")
    private String message;

    @Column(length = 20)
    private String protocol;

    private Integer port;

    @Column(length = 50)
    private String status;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String rawLog;

    @Lob
    @Column(columnDefinition = "LONGTEXT")
    private String normalizedData;

    @Column(nullable = false, updatable = false)
    private LocalDateTime createdAt;

    public SecurityLog() {
    }

    @PrePersist
    protected void onCreate() {
        if (this.timestamp == null) {
            this.timestamp = LocalDateTime.now();
        }
        this.createdAt = LocalDateTime.now();
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getSourceId() {
        return sourceId;
    }

    public void setSourceId(Long sourceId) {
        this.sourceId = sourceId;
    }

    public String getSourceName() {
        return sourceName;
    }

    public void setSourceName(String sourceName) {
        this.sourceName = sourceName;
    }

    public LocalDateTime getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(LocalDateTime timestamp) {
        this.timestamp = timestamp;
    }

    public String getSourceIp() {
        return sourceIp;
    }

    public void setSourceIp(String sourceIp) {
        this.sourceIp = sourceIp;
    }

    public String getDestinationIp() {
        return destinationIp;
    }

    public void setDestinationIp(String destinationIp) {
        this.destinationIp = destinationIp;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEventType() {
        return eventType;
    }

    public void setEventType(String eventType) {
        this.eventType = eventType;
    }

    public String getAction() {
        return action;
    }

    public void setAction(String action) {
        this.action = action;
    }

    public Severity getSeverity() {
        return severity;
    }

    public void setSeverity(Severity severity) {
        this.severity = severity;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getProtocol() {
        return protocol;
    }

    public void setProtocol(String protocol) {
        this.protocol = protocol;
    }

    public Integer getPort() {
        return port;
    }

    public void setPort(Integer port) {
        this.port = port;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getRawLog() {
        return rawLog;
    }

    public void setRawLog(String rawLog) {
        this.rawLog = rawLog;
    }

    public String getNormalizedData() {
        return normalizedData;
    }

    public void setNormalizedData(String normalizedData) {
        this.normalizedData = normalizedData;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }
}
