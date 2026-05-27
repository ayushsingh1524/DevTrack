import json
import asyncio
from typing import Dict, List
from fastapi import WebSocket
from app.core.redis import redis_client

class ConnectionManager:
    def __init__(self):
        # Maps user_id -> List of active WebSocket connections
        self.active_connections: Dict[int, List[WebSocket]] = {}
        self.pubsub_task = None

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        if user_id not in self.active_connections:
            self.active_connections[user_id] = []
        self.active_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if user_id in self.active_connections:
            if websocket in self.active_connections[user_id]:
                self.active_connections[user_id].remove(websocket)
            if not self.active_connections[user_id]:
                del self.active_connections[user_id]

    async def send_personal_message(self, message: dict, user_id: int):
        """Send message to all connections of a specific user."""
        if user_id in self.active_connections:
            dead_connections = []
            for connection in self.active_connections[user_id]:
                try:
                    await connection.send_json(message)
                except Exception:
                    dead_connections.append(connection)
            
            for dead in dead_connections:
                self.disconnect(dead, user_id)

    async def broadcast(self, message: dict):
        """Send message to all connected clients."""
        for user_id, connections in list(self.active_connections.items()):
            await self.send_personal_message(message, user_id)

    async def publish_event(self, event_type: str, payload: dict, target_users: List[int] = None):
        """
        Publish an event to Redis so that all backend workers receive it and 
        can route it to connected WebSockets.
        """
        if not redis_client.redis:
            # Fallback if Redis is not configured: just send it locally
            event = {"type": event_type, "payload": payload, "targets": target_users}
            if target_users:
                for uid in target_users:
                    await self.send_personal_message(event, uid)
            else:
                await self.broadcast(event)
            return

        event = {
            "type": event_type,
            "payload": payload,
            "targets": target_users
        }
        await redis_client.redis.publish("devtrack:events", json.dumps(event))

    async def listen_to_redis(self):
        """Background task that listens to Redis Pub/Sub."""
        if not redis_client.redis:
            return
            
        pubsub = redis_client.redis.pubsub()
        await pubsub.subscribe("devtrack:events")
        
        try:
            async for message in pubsub.listen():
                if message["type"] == "message":
                    data = json.loads(message["data"])
                    targets = data.get("targets")
                    
                    if targets:
                        for uid in targets:
                            await self.send_personal_message(data, uid)
                    else:
                        await self.broadcast(data)
        except Exception as e:
            print(f"Redis PubSub Error: {e}")
            await asyncio.sleep(5)
            # Reconnect logic could go here

manager = ConnectionManager()
