"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import { useAuthStore } from "@/store/authStore";

interface WebSocketMessage {
  type: string;
  payload: unknown;
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
    if (!accessToken || !isAuthenticated || typeof window === "undefined") return;
    if (wsRef.current?.readyState === WebSocket.OPEN || wsRef.current?.readyState === WebSocket.CONNECTING) return;

    const configuredUrl = process.env.NEXT_PUBLIC_WS_URL;
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const baseUrl = configuredUrl || `${protocol}//${window.location.host}/api/v1/ws`;
    const separator = baseUrl.includes("?") ? "&" : "?";
    const ws = new WebSocket(`${baseUrl}${separator}token=${encodeURIComponent(accessToken)}`);

    ws.onopen = () => {
      setIsConnected(true);
      reconnectAttempts.current = 0;
    };

    ws.onmessage = (event) => {
      try {
        setLastMessage(JSON.parse(event.data));
      } catch {
        // Ignore malformed server messages.
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      wsRef.current = null;
      if (isAuthenticated && reconnectAttempts.current < maxReconnectAttempts) {
        const timeout = Math.min(1000 * (2 ** reconnectAttempts.current), 15000);
        reconnectAttempts.current += 1;
        reconnectTimer.current = setTimeout(connect, timeout);
      }
    };

    ws.onerror = () => ws.close();
    wsRef.current = ws;
  }, [accessToken, isAuthenticated]);

  useEffect(() => {
    connect();
    return () => {
      if (reconnectTimer.current) clearTimeout(reconnectTimer.current);
      wsRef.current?.close();
    };
  }, [connect]);

  return { isConnected, lastMessage };
}
