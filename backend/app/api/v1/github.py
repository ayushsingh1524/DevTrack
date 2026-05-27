import os
import json
import asyncio
import random
from typing import Any, Dict
from datetime import datetime, timezone
from fastapi import APIRouter, Depends, BackgroundTasks, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
import httpx

from app.api import deps
from app.models.user import User
from app.models.github import GithubStat
from app.schemas.github import GithubStatusResponse, GithubStatResponse, GithubConnectRequest
from app.core.redis import redis_client
from app.core.config import settings

router = APIRouter()

# Simple deterministic random for mock fallback
def get_mock_random(seed: int, index: int, min_val: int, max_val: int) -> int:
    random.seed(seed + index)
    return random.randint(min_val, max_val)

async def sync_github_data(user_id: int, access_token: str, db: AsyncSession):
    """
    Background task to sync Github data.
    If real access_token is 'mock_token', generates deterministic mock data.
    Otherwise, it would call real Github APIs using httpx.
    """
    try:
        # Simulate network delay for sync
        await asyncio.sleep(2)
        
        commits = 0
        repos = 0
        prs = 0
        top_langs = {}

        if access_token == "mock_token":
            # Generate deterministic mock data
            commits = get_mock_random(user_id, 1, 500, 2500)
            repos = get_mock_random(user_id, 2, 10, 45)
            prs = get_mock_random(user_id, 3, 20, 150)
            
            languages = ["TypeScript", "Python", "Rust", "Go", "HTML"]
            for i, lang in enumerate(languages):
                top_langs[lang] = get_mock_random(user_id, 4+i, 5, 40)
        else:
            # Real Github API logic would go here
            # using httpx.AsyncClient() with Auth bearer
            pass
            
        # Update Database
        query = select(GithubStat).where(GithubStat.user_id == user_id)
        result = await db.execute(query)
        stat = result.scalars().first()

        if not stat:
            stat = GithubStat(user_id=user_id)
            db.add(stat)
            
        stat.commits = commits
        stat.repositories = repos
        stat.pull_requests = prs
        stat.top_languages = top_langs
        stat.updated_at = datetime.now(timezone.utc)

        await db.commit()
        
        # Invalidate cache
        if redis_client.redis:
            await redis_client.redis.delete(f"user:{user_id}:github:stats")

    except Exception as e:
        print(f"Background Sync Error: {e}")
        # In a real app, log error or mark sync as failed

@router.get("/status", response_model=GithubStatusResponse)
async def get_status(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Check if the user is connected to GitHub."""
    query = select(GithubStat.updated_at).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    last_synced = result.scalar()
    
    return GithubStatusResponse(
        is_connected=bool(current_user.github_access_token),
        username=current_user.github_username,
        last_synced=last_synced
    )

@router.post("/connect")
async def connect_github(
    *,
    db: AsyncSession = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """
    Initiates connection. In a real app, this exchanges an OAuth code.
    Here, we simulate successful connection for demonstration.
    """
    # Mocking successful OAuth response
    current_user.github_access_token = "mock_token"
    current_user.github_username = f"developer_{current_user.id}"
    await db.commit()
    
    # Trigger initial sync
    background_tasks.add_task(sync_github_data, current_user.id, "mock_token", db)
    
    return {"status": "success", "message": "Connected to GitHub"}

@router.post("/disconnect")
async def disconnect_github(
    *,
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Removes Github connection."""
    current_user.github_access_token = None
    current_user.github_username = None
    
    # Remove stats
    query = select(GithubStat).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    stat = result.scalars().first()
    if stat:
        await db.delete(stat)
        
    await db.commit()
    
    if redis_client.redis:
        await redis_client.redis.delete(f"user:{current_user.id}:github:stats")
        
    return {"status": "success"}

@router.post("/sync")
async def trigger_sync(
    *,
    db: AsyncSession = Depends(deps.get_db),
    background_tasks: BackgroundTasks,
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Manually trigger a background sync job."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")
        
    background_tasks.add_task(sync_github_data, current_user.id, current_user.github_access_token, db)
    return {"status": "sync_started"}

@router.get("/stats", response_model=GithubStatResponse)
async def get_stats(
    db: AsyncSession = Depends(deps.get_db),
    current_user: User = Depends(deps.get_current_user)
) -> Any:
    """Get aggregated GitHub stats from the database."""
    if not current_user.github_access_token:
        raise HTTPException(status_code=400, detail="GitHub not connected")

    cache_key = f"user:{current_user.id}:github:stats"
    if redis_client.redis:
        cached = await redis_client.redis.get(cache_key)
        if cached:
            return json.loads(cached)

    query = select(GithubStat).where(GithubStat.user_id == current_user.id)
    result = await db.execute(query)
    stat = result.scalars().first()

    if not stat:
        # Fallback empty response if sync hasn't finished
        return {
            "id": 0,
            "user_id": current_user.id,
            "commits": 0,
            "repositories": 0,
            "pull_requests": 0,
            "top_languages": {},
            "updated_at": datetime.now(timezone.utc)
        }

    response_data = GithubStatResponse.model_validate(stat).model_dump(mode='json')
    
    if redis_client.redis:
        await redis_client.redis.setex(cache_key, 3600, json.dumps(response_data))

    return response_data
