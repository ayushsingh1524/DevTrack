"use client";

import React, { useEffect, createContext, useContext } from "react";
import { useWebSocket } from "@/hooks/useWebSocket";
import { useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { useAuthStore } from "@/store/authStore";

const WebSocketContext = createContext<{ isConnected: boolean }>({ isConnected: false });

export function WebSocketProvider({ children }: { children: React.ReactNode }) {
  const { isConnected, lastMessage } = useWebSocket();
  const queryClient = useQueryClient();
  const { user } = useAuthStore();

  useEffect(() => {
    if (!lastMessage) return;

    const { type, payload } = lastMessage;

    switch (type) {
      case "CONNECTION_ESTABLISHED":
        console.log("[WebSocket] Connection verified by server");
        break;

      case "TASK_CREATED":
        // Invalidate the tasks list so the board auto-refreshes
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        // Optional: show a subtle toast if someone else created it
        if (payload.created_by !== user?.id) {
          toast(`New Task Created`, {
            description: payload.title,
            position: "bottom-right",
            duration: 3000,
          });
        }
        break;

      case "TASK_UPDATED":
        // Invalidate queries so Kanban board moves instantly
        queryClient.invalidateQueries({ queryKey: ["tasks"] });
        
        // Optional: toast notification
        toast(`Task Updated`, {
          description: payload.title,
          position: "bottom-right",
          duration: 3000,
        });
        break;
        
      default:
        console.log("[WebSocket] Unhandled event:", type, payload);
    }
  }, [lastMessage, queryClient, user]);

  return (
    <WebSocketContext.Provider value={{ isConnected }}>
      {children}
    </WebSocketContext.Provider>
  );
}

export const useWebSocketContext = () => useContext(WebSocketContext);
