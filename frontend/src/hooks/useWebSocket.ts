"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

interface WebSocketMessage {
  type: string;
  payload: any;
}

export function useWebSocket() {
  const [isConnected, setIsConnected] = useState(false);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);
  
  const wsRef = useRef<WebSocket | null>(null);
  const reconnectAttempts = useRef(0);
  const reconnectTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const maxReconnectAttempts = 5;
  const { accessToken, isAuthenticated } = useAuthStore();

  const connect = useCallback(() => {
    // Only connect when authenticated and we have a token
    if (!accessToken || !isAuthenticated) return;
    if (wsRef.current?.readyState === WebSocket.OPEN) return;
    if (wsRef.current?.readyState === WebSocket.CONNECTING) return;

    try {
      const wsUrl = `ws://localhost:8000/api/v1/ws?token=${accessToken}`;
      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log("[WebSocket] Connected");
        setIsConnected(true);
        reconnectAttempts.current = 0;
      };

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          setLastMessage(data);
        } catch (e) {
          // Silently ignore unparseable messages
        }
      };

      ws.onclose = (event) => {
        setIsConnected(false);
        wsRef.current = null;

        // Only reconnect if we're still authenticated and haven't exceeded max attempts
        if (isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
          const timeout = Math.min(1000 * (2 ** reconnectAttempts.current), 15000);
          reconnectAttempts.current += 1;
          // eslint-disable-next-line @typescript-eslint/no-use-before-define
          reconnectTimer.current = setTimeout(() => connect(), timeout);
        }
      };

      ws.onerror = () => {
        // Silently close — onclose handler will take care of reconnection
        ws.close();
      };

      wsRef.current = ws;
    } catch {
      // Failed to create WebSocket (e.g. invalid URL) — do nothing
    }
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    connect();
    
    return () => {
      // Clean up on unmount
      if (reconnectTimer.current) {
        clearTimeout(reconnectTimer.current);
      }
      if (wsRef.current) {
        wsRef.current.close();
      }
    };
  }, [connect]);

  return { isConnected, lastMessage };
}
