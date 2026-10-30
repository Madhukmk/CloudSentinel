import React, { createContext, useContext, useState, useEffect, useRef, useCallback } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8088/ws';

const WebSocketContext = createContext(null);

export const WebSocketProvider = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState('OFFLINE'); // LIVE, RECONNECTING, OFFLINE
  const [notifications, setNotifications] = useState([]);
  const [liveLogs, setLiveLogs] = useState([]);
  const [liveAlerts, setLiveAlerts] = useState([]);
  const [liveStats, setLiveStats] = useState(null);
  const clientRef = useRef(null);
  const seenAlertIdsRef = useRef(new Set());

  useEffect(() => {
    let reconnectTimeout = null;

    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 3500,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      beforeConnect: () => {
        setConnectionStatus((prev) => (prev === 'OFFLINE' ? 'RECONNECTING' : prev));
      },
      onConnect: () => {
        setConnectionStatus('LIVE');
        console.log('[SOC Broker] Connected to CloudSentinel STOMP stream');

        // 1. Subscribe to live threat alerts
        client.subscribe('/topic/alerts', (message) => {
          try {
            const alert = JSON.parse(message.body);
            if (alert?.id && seenAlertIdsRef.current.has(alert.id)) {
              return; // Duplicate protection
            }
            if (alert?.id) {
              seenAlertIdsRef.current.add(alert.id);
              if (seenAlertIdsRef.current.size > 200) {
                seenAlertIdsRef.current.clear();
              }
            }

            const notifItem = {
              id: alert.id ? `alert-${alert.id}-${Date.now()}` : `notif-${Date.now()}-${Math.random()}`,
              title: alert.title || 'Security Anomaly Detected',
              description: alert.description || `Origin: ${alert.sourceIp || 'Internal network'}`,
              severity: alert.severity || 'HIGH',
              type: 'ALERT',
              timestamp: new Date(),
              read: false,
              link: '/alerts',
              alert,
            };

            setNotifications((prev) => [notifItem, ...prev].slice(0, 30));
            setLiveAlerts((prev) => [alert, ...prev].slice(0, 50));
          } catch (err) {
            console.error('[SOC Broker] Error parsing alert telemetry:', err);
          }
        });

        // 2. Subscribe to live dashboard statistics
        client.subscribe('/topic/stats', (message) => {
          try {
            const stats = JSON.parse(message.body);
            setLiveStats(stats);
          } catch (err) {
            console.error('[SOC Broker] Error parsing stats payload:', err);
          }
        });

        // 3. Subscribe to real-time raw/normalized security logs
        client.subscribe('/topic/logs', (message) => {
          try {
            const log = JSON.parse(message.body);
            setLiveLogs((prev) => [log, ...prev].slice(0, 150));
          } catch (err) {
            console.error('[SOC Broker] Error parsing incoming log:', err);
          }
        });
      },
      onDisconnect: () => {
        setConnectionStatus('OFFLINE');
      },
      onWebSocketClose: () => {
        setConnectionStatus('RECONNECTING');
      },
      onStompError: (frame) => {
        console.warn('[SOC Broker] Broker error frame:', frame.headers['message']);
        setConnectionStatus('RECONNECTING');
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (reconnectTimeout) clearTimeout(reconnectTimeout);
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const dismissNotification = useCallback((id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const addNotification = useCallback((item) => {
    const notifItem = {
      id: `sys-${Date.now()}-${Math.random()}`,
      timestamp: new Date(),
      read: false,
      ...item,
    };
    setNotifications((prev) => [notifItem, ...prev].slice(0, 30));
  }, []);

  const unreadCount = notifications.filter((n) => !n.read).length;
  const connected = connectionStatus === 'LIVE';

  return (
    <WebSocketContext.Provider
      value={{
        connected,
        connectionStatus,
        notifications,
        unreadCount,
        liveLogs,
        liveAlerts,
        liveStats,
        dismissNotification,
        markAsRead,
        markAllAsRead,
        clearNotifications,
        addNotification,
      }}
    >
      {children}
    </WebSocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(WebSocketContext);
  if (!context) {
    throw new Error('useSocket must be used within a WebSocketProvider');
  }
  return context;
};
