package com.cloudsentinel.websocket;

import com.cloudsentinel.dto.DashboardStatsDto;
import com.cloudsentinel.entity.Alert;
import com.cloudsentinel.entity.SecurityLog;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Component;

@Component
public class WebSocketAlertBroadcaster {

    private static final Logger logger = LoggerFactory.getLogger(WebSocketAlertBroadcaster.class);

    @Autowired
    private SimpMessagingTemplate messagingTemplate;

    public void broadcastAlert(Alert alert) {
        try {
            logger.info("Broadcasting live alert via WebSocket: {} - {}", alert.getSeverity(), alert.getTitle());
            messagingTemplate.convertAndSend("/topic/alerts", alert);
        } catch (Exception ex) {
            logger.error("Failed to broadcast alert over WebSocket: {}", ex.getMessage());
        }
    }

    public void broadcastLog(SecurityLog log) {
        try {
            messagingTemplate.convertAndSend("/topic/logs", log);
        } catch (Exception ex) {
            logger.error("Failed to broadcast log over WebSocket: {}", ex.getMessage());
        }
    }

    public void broadcastStats(DashboardStatsDto stats) {
        try {
            messagingTemplate.convertAndSend("/topic/stats", stats);
        } catch (Exception ex) {
            logger.error("Failed to broadcast stats over WebSocket: {}", ex.getMessage());
        }
    }
}
