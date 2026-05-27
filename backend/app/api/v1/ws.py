from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query, Depends
from typing import Optional
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession

from app.core.config import settings
from app.core.websockets import manager
from app.api.deps import get_db
from app.models.user import User

router = APIRouter()

async def get_user_from_token(token: str, db: AsyncSession) -> Optional[User]:
    try:
        payload = jwt.decode(
            token, settings.SECRET_KEY, algorithms=[settings.ALGORITHM]
        )
        token_data = payload.get("sub")
        if token_data is None:
            return None
            
        # Parse user_id from subject which is in format: id:username
        user_id_str = token_data.split(":")[0]
        user_id = int(user_id_str)
        return user_id
    except (JWTError, ValueError, IndexError):
        return None

@router.websocket("/ws")
async def websocket_endpoint(
    websocket: WebSocket,
    token: str = Query(...),
    db: AsyncSession = Depends(get_db)
):
    user_id = await get_user_from_token(token, db)
    
    if not user_id:
        await websocket.accept()
        await websocket.close(code=1008)
        return

    await manager.connect(websocket, user_id)
    
    # Broadcast to user themselves that connection was successful
    await manager.send_personal_message(
        {"type": "CONNECTION_ESTABLISHED", "payload": {"status": "connected"}}, 
        user_id
    )

    try:
        while True:
            # We don't necessarily expect incoming messages from the client 
            # (they use REST API for actions), but we keep the connection alive.
            data = await websocket.receive_text()
            
            # Simple ping/pong could be handled here
            if data == "ping":
                await websocket.send_text("pong")
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
