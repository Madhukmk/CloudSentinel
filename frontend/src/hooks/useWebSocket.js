import { useEffect, useState, useRef } from 'react';
import { Client } from '@stomp/stompjs';
import SockJS from 'sockjs-client';

const WS_URL = import.meta.env.VITE_WS_URL || 'http://localhost:8088/ws';

export const useWebSocket = (onAlertReceived, onStatsReceived, onLogReceived) => {
  const [connected, setConnected] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const clientRef = useRef(null);

  useEffect(() => {
    const client = new Client({
      webSocketFactory: () => new SockJS(WS_URL),
      reconnectDelay: 5000,
      heartbeatIncoming: 4000,
      heartbeatOutgoing: 4000,
      onConnect: () => {
        setConnected(true);
        console.log('[SOC WebSocket] Connected to CloudSentinel live broker');

        // Subscribe to live alerts
        client.subscribe('/topic/alerts', (message) => {
          try {
            const alert = JSON.parse(message.body);
            console.log('[SOC WebSocket] Real-time Alert received:', alert);

            // Add notification toast
            const toast = {
              id: Date.now() + Math.random(),
              alert,
              timestamp: new Date(),
            };
            setNotifications((prev) => [toast, ...prev].slice(0, 5));

            if (onAlertReceived) {
              onAlertReceived(alert);
            }
          } catch (err) {
            console.error('[SOC WebSocket] Error parsing alert message:', err);
          }
        });

        // Subscribe to live dashboard stats
        client.subscribe('/topic/stats', (message) => {
          try {
            const stats = JSON.parse(message.body);
            if (onStatsReceived) {
              onStatsReceived(stats);
            }
          } catch (err) {
            console.error('[SOC WebSocket] Error parsing stats message:', err);
          }
        });

        // Subscribe to live logs
        client.subscribe('/topic/logs', (message) => {
          try {
            const log = JSON.parse(message.body);
            if (onLogReceived) {
              onLogReceived(log);
            }
          } catch (err) {
            console.error('[SOC WebSocket] Error parsing log message:', err);
          }
        });
      },
      onDisconnect: () => {
        setConnected(false);
        console.log('[SOC WebSocket] Disconnected from CloudSentinel broker');
      },
      onStompError: (frame) => {
        console.error('[SOC WebSocket] Broker error:', frame.headers['message']);
      },
    });

    client.activate();
    clientRef.current = client;

    return () => {
      if (clientRef.current) {
        clientRef.current.deactivate();
      }
    };
  }, []);

  const dismissNotification = (id) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  };

  return { connected, notifications, dismissNotification };
};
